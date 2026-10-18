import { CaseAuthorKind, CaseEventType, OrderStatus, Prisma } from "@prisma/client";
import { notifyAdmins } from "@/lib/admin-notifications";
import { queueOrderStatusEmail } from "@/lib/case-email";
import {
  type OrderJourney,
  type PublicCancellationRequest,
  cancellationOption,
} from "@/lib/cancellation-policy";
import { getCertificateBySlug } from "@/lib/catalog";
import { queueTemplateEmail } from "@/lib/email";
import { applyManualPaymentAction } from "@/lib/manual-payment";
import { journeyDeadline, parseBusinessDays } from "@/lib/order-journey";
import { prisma } from "@/lib/prisma";
import { getPrivateCertificateBySlug } from "@/lib/private-catalog";
import { SITE_URL } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";

export type { OrderJourney, PublicCancellationRequest } from "@/lib/cancellation-policy";

function link(path: string) {
  return `${(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "")}${path}`;
}

function toPublicRequest(row: {
  id: string;
  status: string;
  reason: string;
  feeAmount: Prisma.Decimal;
  refundAmount: Prisma.Decimal;
  resolutionNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}): PublicCancellationRequest {
  return {
    id: row.id,
    status: row.status as PublicCancellationRequest["status"],
    reason: row.reason,
    feeAmount: Number(row.feeAmount),
    refundAmount: Number(row.refundAmount),
    resolutionNote: row.resolutionNote,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

function itemDays(item: { certificateType: string; estimatedDays: string | null }) {
  const text =
    item.estimatedDays ||
    getCertificateBySlug(item.certificateType)?.estimatedDays ||
    getPrivateCertificateBySlug(item.certificateType)?.estimatedDays;
  return parseBusinessDays(text);
}

async function loadOrderForJourney(orderId: string, db: Prisma.TransactionClient | typeof prisma = prisma) {
  return db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      protocol: true,
      status: true,
      userId: true,
      customerName: true,
      customerEmail: true,
      totalAmount: true,
      items: { select: { certificateType: true, estimatedDays: true } },
      payments: { select: { status: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" } },
      cancellationRequests: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

type JourneyOrder = NonNullable<Awaited<ReturnType<typeof loadOrderForJourney>>>;

function paidAtOf(order: JourneyOrder) {
  const approved = order.payments.filter((payment) => payment.status === "APPROVED");
  return approved.length ? approved[approved.length - 1].updatedAt : null;
}

function journeyOf(order: JourneyOrder, now = new Date()): OrderJourney {
  const latest = order.cancellationRequests[0] ?? null;
  const pending = latest?.status === "PENDING";
  const paidAt = paidAtOf(order);
  const total = Number(order.totalAmount);
  const ranges = order.items.map(itemDays).filter((value): value is { min: number; max: number } => Boolean(value));
  const maxDays = ranges.length
    ? { min: Math.max(...ranges.map((r) => r.min)), max: Math.max(...ranges.map((r) => r.max)) }
    : null;
  return {
    paidAt: paidAt?.toISOString() ?? null,
    total,
    deadline: journeyDeadline({ internalStatus: order.status, paidAt, maxDays, cancelRequested: pending, now }),
    cancellation: cancellationOption({
      status: order.status,
      payments: order.payments,
      paidAt,
      total,
      hasPendingRequest: pending,
      now,
    }),
    request: latest ? toPublicRequest(latest) : null,
  };
}

export async function getOrderJourney(orderId: string): Promise<OrderJourney | null> {
  const order = await loadOrderForJourney(orderId);
  return order ? journeyOf(order) : null;
}

/** Ids dos pedidos com cancelamento em análise (para as listagens). */
export async function pendingCancellationOrderIds(orderIds?: string[]) {
  const rows = await prisma.cancellationRequest.findMany({
    where: { status: "PENDING", ...(orderIds ? { orderId: { in: orderIds } } : {}) },
    select: { orderId: true },
  });
  return new Set(rows.map((row) => row.orderId));
}

export type RequestResult =
  | { ok: true; outcome: "cancelled" | "requested" }
  | { ok: false; error: string; status: number };

/** Cliente pede o cancelamento. Sem pagamento: cancela na hora. Pago: abre o pedido de estorno. */
export async function requestCancellation(input: { orderId: string; userId: string; reason: string }): Promise<RequestResult> {
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT 1 FROM "Order" WHERE id = ${input.orderId} FOR UPDATE`;
    const order = await loadOrderForJourney(input.orderId, tx);
    if (!order) return { ok: false as const, error: "Pedido não encontrado.", status: 404 };
    const { cancellation } = journeyOf(order);

    if (cancellation.kind === "cancel_unpaid" && cancellation.allowed) {
      await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } });
      await tx.caseEvent.create({
        data: {
          orderId: order.id,
          actorUserId: input.userId,
          type: CaseEventType.STATUS_CHANGED,
          payload: { from: order.status, to: OrderStatus.CANCELLED, display: "CANCELLED", source: "customer", note: input.reason },
        },
      });
      return { ok: true as const, outcome: "cancelled" as const, order };
    }

    if (cancellation.kind === "refund" && cancellation.allowed) {
      await tx.cancellationRequest.create({
        data: {
          orderId: order.id,
          requestedById: input.userId,
          reason: input.reason,
          orderTotal: order.totalAmount,
          feeAmount: cancellation.fee,
          refundAmount: cancellation.refundAmount,
        },
      });
      await tx.caseMessage.create({
        data: {
          orderId: order.id,
          authorUserId: input.userId,
          authorKind: CaseAuthorKind.CLIENT,
          body: `Pedido de cancelamento e estorno: ${input.reason}`,
        },
      });
      await tx.caseEvent.create({
        data: {
          orderId: order.id,
          actorUserId: input.userId,
          type: CaseEventType.STATUS_CHANGED,
          payload: { from: order.status, to: order.status, display: "CANCEL_REQUESTED", source: "customer" },
        },
      });
      return { ok: true as const, outcome: "requested" as const, order, cancellation };
    }

    const reason = "reason" in cancellation && cancellation.reason ? cancellation.reason : "Este pedido não pode ser cancelado agora.";
    return { ok: false as const, error: reason, status: 409 };
  });

  if (!result.ok) return result;
  const { order } = result;
  if (result.outcome === "cancelled") {
    await queueOrderStatusEmail(order, OrderStatus.CANCELLED);
  } else if (result.cancellation?.kind === "refund") {
    await Promise.all([
      queueTemplateEmail({
        key: "cancel_requested",
        to: order.customerEmail,
        toUserId: order.userId,
        orderId: order.id,
        vars: {
          customerName: order.customerName,
          protocol: order.protocol,
          refundAmount: formatCurrency(result.cancellation.refundAmount),
          feeAmount: formatCurrency(result.cancellation.fee),
          orderLink: link(`/painel/pedidos/${order.id}`),
        },
      }),
      notifyAdmins("admin_cancel_request", order.id, { messagePreview: input.reason }),
    ]);
  }
  return { ok: true, outcome: result.outcome };
}

export type ResolveResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * Equipe responde ao pedido. Recusar: o pedido segue. Aprovar: registra o estorno (o dinheiro sai
 * pelo Mercado Pago ou banco antes) e cancela o pedido.
 */
export async function resolveCancellation(input: {
  orderId: string;
  actorUserId: string;
  action: "approve" | "reject";
  note: string;
}): Promise<ResolveResult> {
  const request = await prisma.cancellationRequest.findFirst({
    where: { orderId: input.orderId, status: "PENDING" },
    include: { order: { select: { id: true, protocol: true, status: true, userId: true, customerName: true, customerEmail: true } } },
  });
  if (!request) return { ok: false, error: "Não há pedido de cancelamento em análise.", status: 404 };
  const order = request.order;
  const refund = formatCurrency(Number(request.refundAmount));
  const fee = formatCurrency(Number(request.feeAmount));

  if (input.action === "approve") {
    const applied = await applyManualPaymentAction({
      orderId: order.id,
      actorUserId: input.actorUserId,
      action: "REFUNDED",
      reason: `Cancelamento a pedido do cliente. Estorno de ${refund} (taxa de serviço de ${fee} retida).${input.note ? ` ${input.note}` : ""}`,
    });
    if (!applied.ok) {
      return { ok: false, error: "O estorno não pôde ser registrado para o estado atual do pedido. Recarregue a página.", status: 409 };
    }
  }

  await prisma.$transaction([
    prisma.cancellationRequest.update({
      where: { id: request.id },
      data: {
        status: input.action === "approve" ? "APPROVED" : "REJECTED",
        resolvedById: input.actorUserId,
        resolvedAt: new Date(),
        resolutionNote: input.note || null,
      },
    }),
    prisma.caseMessage.create({
      data: {
        orderId: order.id,
        authorUserId: input.actorUserId,
        authorKind: CaseAuthorKind.STAFF,
        body:
          input.action === "approve"
            ? `Cancelamento confirmado. Estornamos ${refund}; a taxa de serviço de ${fee} ficou retida.${input.note ? ` ${input.note}` : ""}`
            : `Pedido de cancelamento não aprovado.${input.note ? ` ${input.note}` : ""} O pedido segue normalmente.`,
      },
    }),
    ...(input.action === "reject"
      ? [
          prisma.caseEvent.create({
            data: {
              orderId: order.id,
              actorUserId: input.actorUserId,
              type: CaseEventType.STATUS_CHANGED,
              payload: { from: order.status, to: order.status, note: input.note || null, source: "cancel_rejected" },
            },
          }),
        ]
      : []),
  ]);

  await queueTemplateEmail({
    key: input.action === "approve" ? "cancel_request_approved" : "cancel_request_rejected",
    to: order.customerEmail,
    toUserId: order.userId,
    orderId: order.id,
    vars: {
      customerName: order.customerName,
      protocol: order.protocol,
      refundAmount: refund,
      feeAmount: fee,
      resolutionNote: input.note || "",
      orderLink: link(`/painel/pedidos/${order.id}`),
    },
  });
  return { ok: true };
}
