import { NextRequest, NextResponse } from "next/server";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { getCaseAttachment } from "@/lib/case-store";
import { createCaseDownloadUrl } from "@/lib/case-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;

  const attachment = await getCaseAttachment(params.id, params.attachmentId);
  if (!attachment) {
    return NextResponse.json({ success: false, error: "Arquivo não encontrado." }, { status: 404 });
  }

  try {
    const url = await createCaseDownloadUrl(attachment.storagePath);
    return NextResponse.json({ success: true, url, name: attachment.originalName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage indisponível.";
    return NextResponse.json({ success: false, error: message }, { status: 503 });
  }
}
