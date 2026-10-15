import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { renderTemplatePreview } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-layout";
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

  const body = await req.json().catch(() => ({}));

  // Variáveis de amostra do próprio template + overrides opcionais enviados na edição.
  const vars: Record<string, string> = {};
  for (const variable of def.variables) {
    vars[variable.name] = variable.sample;
  }
  if (body.vars && typeof body.vars === "object") {
    for (const [key, value] of Object.entries(body.vars as Record<string, unknown>)) {
      if (value != null) vars[key] = String(value);
    }
  }

  // Permite pré-visualizar um rascunho não salvo (subject/body enviados na requisição).
  const draftSubject = typeof body.subject === "string" ? body.subject : null;
  const draftBody = typeof body.body === "string" ? body.body : null;

  if (draftSubject !== null || draftBody !== null) {
    const { renderTemplateString } = await import("@/lib/email-templates");
    const resolved = await import("@/lib/email-settings").then((m) =>
      m.resolveEmailTemplate(params.key)
    );
    const subjectTpl = draftSubject ?? resolved?.subject ?? def.subject;
    const bodyTpl = draftBody ?? resolved?.body ?? def.body;
    const subject = renderTemplateString(subjectTpl, vars);
    const body = renderTemplateString(bodyTpl, vars);
    return NextResponse.json({
      success: true,
      preview: { subject, body, html: renderBrandedEmail(subject, body).html },
    });
  }

  const preview = await renderTemplatePreview(params.key, vars);
  return NextResponse.json({
    success: true,
    preview: preview && {
      ...preview,
      html: renderBrandedEmail(preview.subject, preview.body).html,
    },
  });
}
