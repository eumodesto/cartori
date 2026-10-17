import { OrderStatus } from "@prisma/client";
import { queueOrderStatusEmail } from "@/lib/case-email";
import { removeCaseObject } from "@/lib/case-storage";
import { updateOrderOperationalStatus } from "@/lib/case-store";
import {
  DELETABLE_ORDER_STATUSES,
  PAYMENT_STATUSES_BLOCKING_DELETE,
  canDeleteOrder,
} from "@/lib/order-bulk";
import { prisma } from "@/lib/prisma";

export type BulkSkip = { id: string; protocol: string | null; reason: string };

/** Mesma regra do pedido individual, aplicada a cada um: o que não pode mudar é pulado, não forçado. */
export async function bulkUpdateOrderStatus(input: {
  orderIds: string[];
  actorUserId: string;
  nextStatus: OrderStatus;
  note?: string;
}) {
  const protocols = await protocolMap(input.orderIds);
  const updated: string[] = [];
  const skipped: BulkSkip[] = [];

  for (const orderId of input.orderIds) {
    const result = await updateOrderOperationalStatus({
      orderId,
      actorUserId: input.actorUserId,
      nextStatus: input.nextStatus,
      note: input.note,
    });
    if (!result.ok) {
      skipped.push({
        id: orderId,
        protocol: protocols.get(orderId) ?? null,
        reason: result.reason === "missing" ? "não encontrado" : "mudança não permitida no status atual",
      });
      continue;
    }
    updated.push(orderId);
    await queueOrderStatusEmail(result.order, input.nextStatus);
  }

  return { updated, skipped };
}

/**
 * Exclusão definitiva (ADMIN): só pedidos que nunca viraram compra, conferidos de novo dentro da
 * transação. Itens, mensagens, eventos e pagamentos pendentes saem em cascata; e-mails ainda não
 * enviados são descartados; arquivos do caso são apagados do storage depois.
 */
export async function deleteOrdersPermanently(input: { orderIds: string[]; actorUserId: string }) {
  const now = Date.now();
  const result = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { id: { in: input.orderIds } },
      select: {
        id: true,
        protocol: true,
        status: true,
        payments: { select: { status: true, createdAt: true } },
        caseAttachments: { select: { storagePath: true } },
      },
    });
    const found = new Set(orders.map((order) => order.id));
    const eligible = orders.filter((order) => canDeleteOrder(order.status, order.payments, now));
    const skipped: BulkSkip[] = [
      ...input.orderIds
        .filter((id) => !found.has(id))
        .map((id) => ({ id, protocol: null, reason: "não encontrado" })),
      ...orders
        .filter((order) => !eligible.includes(order))
        .map((order) => ({
          id: order.id,
          protocol: order.protocol,
          reason: "tem pagamento registrado ou já está em andamento",
        })),
    ];
    const ids = eligible.map((order) => order.id);
    if (ids.length > 0) {
      await tx.emailOutbox.deleteMany({ where: { orderId: { in: ids }, status: "PENDING" } });
      await tx.order.deleteMany({
        where: {
          id: { in: ids },
          status: { in: [...DELETABLE_ORDER_STATUSES] },
          payments: { none: { status: { in: [...PAYMENT_STATUSES_BLOCKING_DELETE] } } },
        },
      });
    }
    return {
      deleted: eligible.map((order) => ({ id: order.id, protocol: order.protocol })),
      skipped,
      storagePaths: eligible.flatMap((order) => order.caseAttachments.map((file) => file.storagePath)),
    };
  });

  // CaseEvent sai junto com o pedido: o rastro da exclusão fica no log do servidor.
  console.warn("[orders] bulk_delete", {
    actorUserId: input.actorUserId,
    protocols: result.deleted.map((order) => order.protocol),
  });

  for (const path of result.storagePaths) {
    await removeCaseObject(path).catch((error) =>
      console.error("[orders] bulk_delete_storage", { path, error: String(error) })
    );
  }

  return { deleted: result.deleted, skipped: result.skipped };
}

async function protocolMap(orderIds: string[]) {
  const rows = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, protocol: true },
  });
  return new Map(rows.map((row) => [row.id, row.protocol]));
}
