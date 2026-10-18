import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { renderBrandedEmail } from "@/lib/email-layout";
import { renderTemplateDraft } from "@/lib/email-template-render";
import { getEmailTemplateDef } from "@/lib/email-templates";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const gate = await requirePlatformAdmin("admin.email");
  if (!gate.ok) return gate.response;

  const def = getEmailTemplateDef(params.key);
  if (!def) {
    return NextResponse.json(
      { success: false, error: "Template desconhecido." },
      { status: 404 }
    );
  }

  // Amostras das variáveis + rascunho não salvo (subject/body), quando enviados.
  const body = await req.json().catch(() => ({}));
  const preview = await renderTemplateDraft(def, body);
  return NextResponse.json({
    success: true,
    preview: { ...preview, html: renderBrandedEmail(preview.subject, preview.body).html },
  });
}
