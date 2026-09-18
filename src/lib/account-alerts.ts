import { CaseAuthorKind, CaseEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderStatusMeta } from "@/lib/order-status";

export type AccountAlertType = "status" | "message";

export type AccountAlert = {
  id: string;
  type: AccountAlertType;
  orderId: string;
  protocol: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

const ALERT_TAKE = 20;
const OWNED_ORDER_TAKE = 80;

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function preview(text: string, max = 140) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

/** Inbox da conta: só pedidos do userId. Membership não amplia a lista. */
export async function listAccountAlerts(userId: string): Promise<AccountAlert[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: { id: true, protocol: true },
    orderBy: { updatedAt: "desc" },
    take: OWNED_ORDER_TAKE,
  });

  if (orders.length === 0) return [];

  const byId = new Map(orders.map((order) => [order.id, order]));
  const orderIds = orders.map((order) => order.id);

  const [messages, events] = await Promise.all([
    prisma.caseMessage.findMany({
      where: {
        orderId: { in: orderIds },
        authorKind: { in: [CaseAuthorKind.STAFF, CaseAuthorKind.SYSTEM] },
      },
      orderBy: { createdAt: "desc" },
      take: ALERT_TAKE,
      select: { id: true, orderId: true, body: true, createdAt: true },
    }),
    prisma.caseEvent.findMany({
      where: {
        orderId: { in: orderIds },
        type: CaseEventType.STATUS_CHANGED,
      },
      orderBy: { createdAt: "desc" },
      take: ALERT_TAKE,
      select: { id: true, orderId: true, payload: true, createdAt: true },
    }),
  ]);

  const alerts: AccountAlert[] = [];

  for (const message of messages) {
    const order = byId.get(message.orderId);
    if (!order) continue;
    alerts.push({
      id: `message:${message.id}`,
      type: "message",
      orderId: order.id,
      protocol: order.protocol,
      title: "Nova mensagem",
      body: preview(message.body) || "A equipe Cartori enviou uma mensagem.",
      href: `/painel/pedidos/${order.id}`,
      createdAt: message.createdAt.toISOString(),
    });
  }

  for (const event of events) {
    const order = byId.get(event.orderId);
    if (!order) continue;
    const payload = asRecord(event.payload);
    const nextStatus = String(payload.to || "");
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const statusLabel = orderStatusMeta(nextStatus).label;
    alerts.push({
      id: `status:${event.id}`,
      type: "status",
      orderId: order.id,
      protocol: order.protocol,
      title: "Status atualizado",
      body: note
        ? preview(`${statusLabel}. ${note}`)
        : `Pedido ${order.protocol}: ${statusLabel}.`,
      href: `/painel/pedidos/${order.id}`,
      createdAt: event.createdAt.toISOString(),
    });
  }

  return alerts
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, ALERT_TAKE);
}
