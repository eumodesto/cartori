import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { canStaffSetOrderStatus, requirePlatformAdmin } from "@/lib/authorization";
import { requireStaffOps } from "@/lib/case-access";
import { sanitizeCaseBody } from "@/lib/case-types";
import { BULK_ORDER_LIMIT, DELETE_CONFIRM_WORD, parseBulkOrderIds } from "@/lib/order-bulk";
import { bulkUpdateOrderStatus, deleteOrdersPermanently } from "@/lib/order-bulk-store";

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

/**
 * Ações em massa da mesa.
 * - action "status": OPERATOR e ADMIN; cada pedido segue a regra de transição individual.
 * - action "delete": só ADMIN de plataforma, com a palavra de confirmação.
 * Pagamento nunca muda por aqui.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action || "");

  const orderIds = parseBulkOrderIds(body.orderIds);
  if (!orderIds) return badRequest(`Selecione de 1 a ${BULK_ORDER_LIMIT} pedidos.`);

  if (action === "status") {
    const staff = await requireStaffOps();
    if (!staff.ok) return staff.response;
    const target = String(body.status || "");
    if (!canStaffSetOrderStatus(target)) return badRequest("Status inválido.");
    const note = sanitizeCaseBody(body.note);
    const result = await bulkUpdateOrderStatus({
      orderIds,
      actorUserId: staff.context.userId,
      nextStatus: target as OrderStatus,
      note: note || undefined,
    });
    return NextResponse.json({ success: true, ...result });
  }

  if (action === "delete") {
    const gate = await requirePlatformAdmin("ops.orders.delete");
    if (!gate.ok) return gate.response;
    if (String(body.confirm || "").trim().toUpperCase() !== DELETE_CONFIRM_WORD) {
      return badRequest(`Digite ${DELETE_CONFIRM_WORD} para confirmar.`);
    }
    const result = await deleteOrdersPermanently({ orderIds, actorUserId: gate.context.userId });
    return NextResponse.json({ success: true, ...result });
  }

  return badRequest("Ação inválida.");
}
