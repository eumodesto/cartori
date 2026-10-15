import { CaseEventType, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import {
  MANUAL_PAYMENT_PROVIDER,
  manualPaymentActions,
  type ManualPaymentAction,
} from "@/lib/manual-payment-policy";
import { prisma } from "@/lib/prisma";

export * from "@/lib/manual-payment-policy";

const AWAITING_PAYMENT: OrderStatus[] = [OrderStatus.DRAFT, OrderStatus.PENDING_PAYMENT];

type ManualResult =
  | { ok: true; from: OrderStatus; to: OrderStatus }
  | { ok: false; reason: "missing" | "not_allowed" | "conflict" };

/**
 * Exceção administrativa ao fluxo do Mercado Pago (pagamento ou estorno fora do site).
 * Valor vem sempre do pedido; motivo e autor ficam no histórico. Não movimenta dinheiro.
 */
export async function applyManualPaymentAction(input: {
  orderId: string;
  actorUserId: string;
  action: ManualPaymentAction;
  reason: string;
}): Promise<ManualResult> {
  return prisma.$transaction(async (tx): Promise<ManualResult> => {
    await tx.$executeRaw`SELECT 1 FROM "Order" WHERE id = ${input.orderId} FOR UPDATE`;
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        payments: {
          select: { id: true, status: true, paymentMethod: true, metadata: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!order) return { ok: false, reason: "missing" };
    if (!manualPaymentActions(order).includes(input.action)) {
      return { ok: false, reason: "not_allowed" };
    }

    const audit = {
      manual: true,
      reason: input.reason,
      actorUserId: input.actorUserId,
      at: new Date().toISOString(),
    };
    const method = order.payments[0]?.paymentMethod ?? PaymentMethod.PIX;
    let to: OrderStatus = order.status;

    if (input.action === "PAYMENT_APPROVED" || input.action === "PAYMENT_REJECTED") {
      const approved = input.action === "PAYMENT_APPROVED";
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: MANUAL_PAYMENT_PROVIDER,
          paymentMethod: method,
          status: approved ? PaymentStatus.APPROVED : PaymentStatus.REJECTED,
          amount: order.totalAmount,
          metadata: audit,
        },
      });
      if (approved) {
        const moved = await tx.order.updateMany({
          where: { id: order.id, status: { in: AWAITING_PAYMENT } },
          data: { status: OrderStatus.PAID },
        });
        if (moved.count !== 1) throw new ManualConflict();
        to = OrderStatus.PAID;
      }
    } else {
      const approvedRows = order.payments.filter((p) => p.status === PaymentStatus.APPROVED);
      for (const payment of approvedRows) {
        const metadata =
          payment.metadata && typeof payment.metadata === "object" && !Array.isArray(payment.metadata)
            ? (payment.metadata as Prisma.JsonObject)
            : {};
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED, metadata: { ...metadata, manualRefund: audit } },
        });
      }
      if (order.status !== OrderStatus.CANCELLED) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });
      }
      to = OrderStatus.CANCELLED;
    }

    await tx.caseEvent.create({
      data: {
        orderId: order.id,
        actorUserId: input.actorUserId,
        type: CaseEventType.STATUS_CHANGED,
        payload: {
          from: order.status,
          to,
          display: input.action,
          manual: true,
          reason: input.reason,
        },
      },
    });

    return { ok: true, from: order.status, to };
  }).catch((error: unknown): ManualResult => {
    if (error instanceof ManualConflict) return { ok: false, reason: "conflict" };
    throw error;
  });
}

class ManualConflict extends Error {}
