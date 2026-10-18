import { NextRequest, NextResponse } from "next/server";
import { CaseAuthorKind } from "@prisma/client";
import { notifyAdmins } from "@/lib/admin-notifications";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { queueCaseEmail } from "@/lib/case-email";
import { getOrderJourney } from "@/lib/cancellation-store";
import { loadOrderCase, postCaseMessage } from "@/lib/case-store";
import { prisma } from "@/lib/prisma";
import { sanitizeCaseBody } from "@/lib/case-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;
  const [data, journey] = await Promise.all([
    loadOrderCase(params.id, access.staff ? "staff" : "customer"),
    getOrderJourney(params.id),
  ]);
  if (!data) {
    return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...data, journey, staff: access.staff });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;

  const body = await req.json().catch(() => ({}));
  const text = sanitizeCaseBody((body as { body?: unknown }).body);
  if (!text) {
    return NextResponse.json({ success: false, error: "Escreva a mensagem." }, { status: 400 });
  }

  const authorKind = access.staff ? CaseAuthorKind.STAFF : CaseAuthorKind.CLIENT;
  await postCaseMessage({
    orderId: params.id,
    authorUserId: access.context.userId,
    authorKind,
    body: text,
  });

  if (authorKind === CaseAuthorKind.STAFF) {
    await queueCaseEmail({
      orderId: params.id,
      toEmail: access.order.customerEmail,
      toUserId: access.order.userId,
      template: "new_message",
      protocol: access.order.protocol,
      preview: text,
    });
  } else {
    // Quem já respondeu pela equipe neste pedido recebe a resposta do cliente, além dos ADMIN.
    const staffAuthors = await prisma.caseMessage.findMany({
      where: { orderId: params.id, authorKind: CaseAuthorKind.STAFF, authorUserId: { not: null } },
      select: { authorUserId: true },
      distinct: ["authorUserId"],
    });
    await notifyAdmins("admin_customer_message", params.id, {
      messagePreview: text,
      alsoStaffUserIds: staffAuthors.flatMap((row) => (row.authorUserId ? [row.authorUserId] : [])),
    });
  }

  const [data, journey] = await Promise.all([
    loadOrderCase(params.id, access.staff ? "staff" : "customer"),
    getOrderJourney(params.id),
  ]);
  return NextResponse.json({ success: true, ...data, journey, staff: access.staff }, { status: 201 });
}
