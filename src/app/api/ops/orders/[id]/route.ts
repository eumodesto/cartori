import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { staffTransitionTargets } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { requireStaffOps } from "@/lib/case-access";
import { queueOrderStatusEmail } from "@/lib/case-email";
import { loadOrderCase, updateOrderOperationalStatus } from "@/lib/case-store";
import { sanitizeCaseBody } from "@/lib/case-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;
  const data = await loadOrderCase(params.id, "staff");
  if (!data) {
    return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
  }
  const approved = await prisma.payment.findFirst({
    where: { orderId: params.id, status: "APPROVED" },
    select: { id: true },
  });
  return NextResponse.json({
    success: true,
    ...data,
    staff: true,
    allowedStatuses: staffTransitionTargets(data.order.status, {
      hasApprovedPayment: Boolean(approved),
    }),
  });
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

  const updated = await updateOrderOperationalStatus({
    orderId: params.id,
    actorUserId: staff.context.userId,
    nextStatus: status as OrderStatus,
    note: note || undefined,
  });
  if (!updated.ok) {
    if (updated.reason === "missing") {
      return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Esta mudança de status não é permitida a partir do estado atual. Pagamento continua no servidor.",
      },
      { status: 400 }
    );
  }

  await queueOrderStatusEmail(updated.order, status);

  const data = await loadOrderCase(params.id, "staff");
  const approved = await prisma.payment.findFirst({
    where: { orderId: params.id, status: "APPROVED" },
    select: { id: true },
  });
  return NextResponse.json({
    success: true,
    ...data,
    staff: true,
    allowedStatuses: staffTransitionTargets(updated.order.status, {
      hasApprovedPayment: Boolean(approved),
    }),
  });
}
