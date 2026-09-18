import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { canStaffSetOrderStatus } from "@/lib/authorization";
import { requireStaffOps } from "@/lib/case-access";
import { queueCaseEmail, statusLabelForEmail } from "@/lib/case-email";
import { loadOrderCase, updateOrderOperationalStatus } from "@/lib/case-store";
import { sanitizeCaseBody } from "@/lib/case-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;
  const data = await loadOrderCase(params.id);
  if (!data) {
    return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...data, staff: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;

  const body = await req.json().catch(() => ({}));
  const status = String((body as { status?: unknown }).status || "");
  const note = sanitizeCaseBody((body as { note?: unknown }).note);

  if (!canStaffSetOrderStatus(status)) {
    return NextResponse.json(
      { success: false, error: "Este status não pode ser definido pela mesa. Pagamento continua no Mercado Pago." },
      { status: 400 }
    );
  }

  const updated = await updateOrderOperationalStatus({
    orderId: params.id,
    actorUserId: staff.context.userId,
    nextStatus: status as OrderStatus,
    note: note || undefined,
  });
  if (!updated) {
    return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
  }

  await queueCaseEmail({
    orderId: params.id,
    toEmail: updated.order.customerEmail,
    toUserId: updated.order.userId,
    template: "status_changed",
    protocol: updated.order.protocol,
    preview: note,
    statusLabel: statusLabelForEmail(status),
  });

  const data = await loadOrderCase(params.id);
  return NextResponse.json({ success: true, ...data, staff: true });
}
