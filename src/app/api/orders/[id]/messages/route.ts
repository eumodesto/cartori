import { NextRequest, NextResponse } from "next/server";
import { CaseAuthorKind } from "@prisma/client";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { queueCaseEmail } from "@/lib/case-email";
import { loadOrderCase, postCaseMessage } from "@/lib/case-store";
import { sanitizeCaseBody } from "@/lib/case-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;
  const data = await loadOrderCase(params.id);
  if (!data) {
    return NextResponse.json({ success: false, error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...data, staff: access.staff });
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
  }

  const data = await loadOrderCase(params.id);
  return NextResponse.json({ success: true, ...data, staff: access.staff }, { status: 201 });
}
