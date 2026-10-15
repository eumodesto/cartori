import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { notifyAdmins } from "@/lib/admin-notifications";
import { canStaffSetOrderStatus, requirePlatformAdmin } from "@/lib/authorization";
import { queueOrderStatusEmail } from "@/lib/case-email";
import { updateOrderOperationalStatus } from "@/lib/case-store";
import { sanitizeCaseBody } from "@/lib/case-types";
import {
  MANUAL_REASON_MIN,
  applyManualPaymentAction,
  isManualPaymentAction,
  sanitizeManualReason,
} from "@/lib/manual-payment";

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePlatformAdmin("admin.orders.status");
  if (!gate.ok) return gate.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const target = String(body.target || "");

  if (isManualPaymentAction(target)) {
    const reason = sanitizeManualReason(body.reason);
    if (reason.length < MANUAL_REASON_MIN) {
      return badRequest(`Explique o motivo (mínimo de ${MANUAL_REASON_MIN} caracteres).`);
    }
    const result = await applyManualPaymentAction({
      orderId: params.id,
      actorUserId: gate.context.userId,
      action: target,
      reason,
    });
    if (!result.ok) {
      if (result.reason === "missing") {
        return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
      }
      return NextResponse.json(
        {
          success: false,
          error: "Esse status de pagamento não pode ser aplicado ao pedido agora. Recarregue a página.",
        },
        { status: 409 }
      );
    }
    console.warn("[payments] manual_override", {
      orderId: params.id,
      actorUserId: gate.context.userId,
      action: target,
      from: result.from,
      to: result.to,
    });
    if (target === "PAYMENT_APPROVED") await notifyAdmins("admin_order_paid", params.id);
    if (target === "PAYMENT_REJECTED") await notifyAdmins("admin_payment_rejected", params.id);
    return NextResponse.json({ success: true });
  }

  if (!canStaffSetOrderStatus(target)) {
    return badRequest("Status inválido.");
  }

  const note = sanitizeCaseBody(body.note);
  const updated = await updateOrderOperationalStatus({
    orderId: params.id,
    actorUserId: gate.context.userId,
    nextStatus: target as OrderStatus,
    note: note || undefined,
  });
  if (!updated.ok) {
    if (updated.reason === "missing") {
      return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
    }
    return badRequest("Esta mudança de status não é permitida a partir do estado atual.");
  }

  await queueOrderStatusEmail(updated.order, target);
  return NextResponse.json({ success: true });
}
