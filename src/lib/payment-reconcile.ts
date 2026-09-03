import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { getPaymentById } from "@/lib/mercadopago";
import { moneyToCents } from "@/lib/money-cents";
import { prisma } from "@/lib/prisma";

export type MercadoPagoPaymentSnapshot = {
  id: string;
  status?: string;
  currencyId?: string;
  transactionAmount?: Prisma.Decimal | number | string;
  externalReference?: string;
  metadataOrderId?: string;
};

export type ReconcileReason =
  | "paid"
  | "already_paid"
  | "not_approved"
  | "payment_status_updated"
  | "unlinked"
  | "empty_reference"
  | "reference_mismatch"
  | "amount_mismatch"
  | "currency_mismatch"
  | "order_not_payable"
  | "mp_not_found";

export type ReconcileResult = {
  applied: boolean;
  paid: boolean;
  reason: ReconcileReason;
  orderId?: string;
};

const reconcileLocks = new Map<string, Promise<ReconcileResult>>();

const PAYABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
];

function logPaymentEvent(
  event: string,
  extra: Record<string, string | number | boolean | undefined>
) {
  console.warn(`[payments] ${event}`, extra);
}

function metadataOrderId(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }
  const orderId = (metadata as Record<string, unknown>).order_id;
  if (orderId === undefined || orderId === null) return undefined;
  const value = String(orderId).trim();
  return value || undefined;
}

export function snapshotMercadoPagoPayment(
  raw: unknown
): MercadoPagoPaymentSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const payment = raw as Record<string, unknown>;
  if (payment.id === undefined || payment.id === null || payment.id === "") {
    return null;
  }

  return {
    id: String(payment.id),
    status: typeof payment.status === "string" ? payment.status : undefined,
    currencyId:
      typeof payment.currency_id === "string" ? payment.currency_id : undefined,
    transactionAmount:
      payment.transaction_amount === undefined || payment.transaction_amount === null
        ? undefined
        : (payment.transaction_amount as number | string),
    externalReference:
      typeof payment.external_reference === "string"
        ? payment.external_reference.trim()
        : undefined,
    metadataOrderId: metadataOrderId(payment.metadata),
  };
}

function mapPaymentStatus(status?: string): PaymentStatus {
  if (status === "approved") return PaymentStatus.APPROVED;
  if (status === "rejected") return PaymentStatus.REJECTED;
  if (status === "cancelled") return PaymentStatus.CANCELLED;
  if (status === "refunded") return PaymentStatus.REFUNDED;
  if (status === "in_process" || status === "in_mediation") {
    return PaymentStatus.IN_PROCESS;
  }
  return PaymentStatus.PENDING;
}

export async function reconcileFetchedPayment(
  snapshot: MercadoPagoPaymentSnapshot
): Promise<ReconcileResult> {
  const providerPaymentId = snapshot.id.trim();
  if (!providerPaymentId) {
    logPaymentEvent("unlinked", { reason: "empty_provider_payment_id" });
    return { applied: false, paid: false, reason: "unlinked" };
  }

  const local = await prisma.payment.findUnique({
    where: { providerPaymentId },
    include: { order: true },
  });

  if (!local?.order) {
    logPaymentEvent("unlinked", { providerPaymentId });
    return { applied: false, paid: false, reason: "unlinked" };
  }

  const order = local.order;
  const resultBase = { orderId: order.id };

  const externalReference = snapshot.externalReference || "";
  if (!externalReference) {
    logPaymentEvent("empty_reference", { providerPaymentId, orderId: order.id });
    return { applied: false, paid: false, reason: "empty_reference", ...resultBase };
  }

  if (externalReference !== order.id) {
    logPaymentEvent("reference_mismatch", {
      providerPaymentId,
      orderId: order.id,
    });
    return { applied: false, paid: false, reason: "reference_mismatch", ...resultBase };
  }

  if (snapshot.metadataOrderId && snapshot.metadataOrderId !== order.id) {
    logPaymentEvent("reference_mismatch", {
      providerPaymentId,
      orderId: order.id,
      source: "metadata",
    });
    return { applied: false, paid: false, reason: "reference_mismatch", ...resultBase };
  }

  if (!snapshot.currencyId || snapshot.currencyId.toUpperCase() !== "BRL") {
    logPaymentEvent("currency_mismatch", {
      providerPaymentId,
      orderId: order.id,
      currency: snapshot.currencyId || "",
    });
    return { applied: false, paid: false, reason: "currency_mismatch", ...resultBase };
  }

  if (snapshot.transactionAmount === undefined) {
    logPaymentEvent("amount_mismatch", {
      providerPaymentId,
      orderId: order.id,
      reason: "missing_transaction_amount",
    });
    return { applied: false, paid: false, reason: "amount_mismatch", ...resultBase };
  }

  const expectedCents = moneyToCents(order.totalAmount);
  const localPaymentCents = moneyToCents(local.amount);
  const paidCents = moneyToCents(snapshot.transactionAmount);
  if (paidCents !== expectedCents || localPaymentCents !== expectedCents) {
    logPaymentEvent("amount_mismatch", {
      providerPaymentId,
      orderId: order.id,
      expectedCents,
      paidCents,
      localPaymentCents,
    });
    return { applied: false, paid: false, reason: "amount_mismatch", ...resultBase };
  }

  if (!PAYABLE_ORDER_STATUSES.includes(order.status)) {
    logPaymentEvent("order_not_payable", {
      providerPaymentId,
      orderId: order.id,
      status: order.status,
    });
    return { applied: false, paid: false, reason: "order_not_payable", ...resultBase };
  }

  const nextPaymentStatus = mapPaymentStatus(snapshot.status);

  if (snapshot.status !== "approved") {
    if (local.status !== nextPaymentStatus) {
      await prisma.payment.update({
        where: { id: local.id },
        data: { status: nextPaymentStatus },
      });
      return {
        applied: true,
        paid: false,
        reason: "payment_status_updated",
        ...resultBase,
      };
    }
    return { applied: false, paid: false, reason: "not_approved", ...resultBase };
  }

  if (order.status === OrderStatus.PAID && local.status === PaymentStatus.APPROVED) {
    logPaymentEvent("idempotent", { providerPaymentId, orderId: order.id });
    return { applied: false, paid: true, reason: "already_paid", ...resultBase };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: local.id },
      data: { status: PaymentStatus.APPROVED },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID },
    }),
  ]);

  return { applied: true, paid: true, reason: "paid", ...resultBase };
}

export async function reconcileMercadoPagoPayment(
  providerPaymentId: string
): Promise<ReconcileResult> {
  const id = String(providerPaymentId || "").trim();
  if (!id) {
    return { applied: false, paid: false, reason: "unlinked" };
  }

  const pending = reconcileLocks.get(id);
  if (pending) return pending;

  const task: Promise<ReconcileResult> = (async (): Promise<ReconcileResult> => {
    let raw: unknown;
    try {
      raw = await getPaymentById(id);
    } catch (error) {
      logPaymentEvent("mp_not_found", { providerPaymentId: id });
      console.warn("[payments] mp_fetch_failed", {
        providerPaymentId: id,
        message: error instanceof Error ? error.message : "unknown",
      });
      return { applied: false, paid: false, reason: "mp_not_found" };
    }

    const snapshot = snapshotMercadoPagoPayment(raw);
    if (!snapshot) {
      logPaymentEvent("mp_not_found", { providerPaymentId: id });
      return { applied: false, paid: false, reason: "mp_not_found" };
    }

    return reconcileFetchedPayment(snapshot);
  })();

  const tracked = task.finally(() => {
    reconcileLocks.delete(id);
  });
  reconcileLocks.set(id, tracked);
  return tracked;
}
