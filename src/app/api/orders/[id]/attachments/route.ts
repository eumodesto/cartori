import { NextRequest, NextResponse } from "next/server";
import { CaseAttachmentKind } from "@prisma/client";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { queueCaseEmail } from "@/lib/case-email";
import { createCaseAttachment } from "@/lib/case-store";
import {
  assertCaseFileLimits,
  createCaseUploadUrl,
} from "@/lib/case-storage";
import {
  CASE_ATTACHMENT_KINDS,
  isAllowedCaseMime,
  safeUploadName,
} from "@/lib/case-types";
import { createId } from "@/lib/utils";

const KINDS = new Set(CASE_ATTACHMENT_KINDS.map((item) => item.value));

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;

  const body = await req.json().catch(() => ({}));
  const kind = String((body as { kind?: unknown }).kind || "") as CaseAttachmentKind;
  const originalName = safeUploadName(String((body as { fileName?: unknown }).fileName || ""));
  const mimeType = String((body as { mimeType?: unknown }).mimeType || "").toLowerCase();
  const sizeBytes = Number((body as { sizeBytes?: unknown }).sizeBytes);

  if (!KINDS.has(kind)) {
    return NextResponse.json({ success: false, error: "Informe o tipo do documento." }, { status: 400 });
  }
  if (!isAllowedCaseMime(mimeType)) {
    return NextResponse.json(
      { success: false, error: "Envie PDF, JPG, PNG ou WEBP." },
      { status: 400 }
    );
  }
  const sizeError = assertCaseFileLimits(sizeBytes);
  if (sizeError) {
    return NextResponse.json({ success: false, error: sizeError }, { status: 400 });
  }

  const attachmentId = createId();
  const storagePath = `${params.id}/${attachmentId}/${originalName}`;

  let upload;
  try {
    upload = await createCaseUploadUrl(storagePath);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Storage indisponível.";
    return NextResponse.json({ success: false, error: message }, { status: 503 });
  }

  const attachment = await createCaseAttachment({
    orderId: params.id,
    uploadedByUserId: access.context.userId,
    kind,
    originalName,
    mimeType,
    sizeBytes,
    storagePath,
  });

  if (access.staff) {
    await queueCaseEmail({
      orderId: params.id,
      toEmail: access.order.customerEmail,
      toUserId: access.order.userId,
      template: "attachment_uploaded",
      protocol: access.order.protocol,
      preview: originalName,
    });
  }

  return NextResponse.json({
    success: true,
    attachment: {
      id: attachment.id,
      kind: attachment.kind,
      originalName: attachment.originalName,
    },
    upload,
  });
}
