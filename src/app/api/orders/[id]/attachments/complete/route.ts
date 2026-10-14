import { NextRequest, NextResponse } from "next/server";
import { CaseAttachmentKind } from "@prisma/client";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { queueCaseEmail } from "@/lib/case-email";
import { createCaseAttachment } from "@/lib/case-store";
import {
  assertCaseFileLimits,
  removeCaseObject,
  statCaseObject,
} from "@/lib/case-storage";
import { CASE_ATTACHMENT_KINDS, isAllowedCaseMime, safeUploadName } from "@/lib/case-types";

const KINDS = new Set(CASE_ATTACHMENT_KINDS.map((item) => item.value));

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;

  const body = await req.json().catch(() => ({}));
  const attachmentId = String((body as { attachmentId?: unknown }).attachmentId || "").trim();
  const storagePath = String((body as { storagePath?: unknown }).storagePath || "").trim();
  const kind = String((body as { kind?: unknown }).kind || "") as CaseAttachmentKind;
  const originalName = safeUploadName(String((body as { fileName?: unknown }).fileName || ""));
  const declaredMime = String((body as { mimeType?: unknown }).mimeType || "").toLowerCase();

  const expectedPath = `${params.id}/${attachmentId}/${originalName}`;
  if (!attachmentId || storagePath !== expectedPath || !KINDS.has(kind)) {
    return NextResponse.json({ success: false, error: "Envio inválido." }, { status: 400 });
  }

  let object;
  try {
    object = await statCaseObject(storagePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage indisponível.";
    return NextResponse.json({ success: false, error: message }, { status: 503 });
  }

  if (!object) {
    return NextResponse.json(
      { success: false, error: "O arquivo não foi encontrado no armazenamento." },
      { status: 400 }
    );
  }

  const sizeError = assertCaseFileLimits(object.size);
  const mimeType = object.mimeType || declaredMime;
  if (sizeError || !isAllowedCaseMime(mimeType)) {
    try {
      await removeCaseObject(storagePath);
    } catch {
      // O objeto inválido fica órfão se o storage recusar a remoção.
    }
    return NextResponse.json(
      {
        success: false,
        error: sizeError || "Envie PDF, JPG, PNG ou WEBP.",
      },
      { status: 400 }
    );
  }

  const attachment = await createCaseAttachment({
    orderId: params.id,
    uploadedByUserId: access.context.userId,
    kind,
    originalName,
    mimeType,
    sizeBytes: object.size,
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
  });
}
