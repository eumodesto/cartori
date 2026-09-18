import { NextRequest, NextResponse } from "next/server";
import { requireUserManagement } from "@/lib/admin-users";
import {
  resetTemplateOverride,
  resolveEmailTemplate,
  saveTemplateOverride,
} from "@/lib/email-settings";
import { getEmailTemplateDef } from "@/lib/email-templates";

function serialize(resolved: NonNullable<Awaited<ReturnType<typeof resolveEmailTemplate>>>) {
  return {
    key: resolved.key,
    group: resolved.def.group,
    label: resolved.def.label,
    description: resolved.def.description,
    status: resolved.def.status ?? null,
    subject: resolved.subject,
    body: resolved.body,
    variables: resolved.def.variables,
    source: resolved.source,
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  if (!getEmailTemplateDef(params.key)) {
    return NextResponse.json(
      { success: false, error: "Template desconhecido." },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const subject = String(body.subject ?? "").trim();
  const templateBody = String(body.body ?? "").trim();
  const active = body.active === undefined ? true : Boolean(body.active);

  if (!subject) {
    return NextResponse.json(
      { success: false, error: "Informe o assunto do e-mail." },
      { status: 400 }
    );
  }
  if (!templateBody) {
    return NextResponse.json(
      { success: false, error: "Informe o corpo do e-mail." },
      { status: 400 }
    );
  }

  await saveTemplateOverride(params.key, { subject, body: templateBody, active });
  const resolved = await resolveEmailTemplate(params.key);
  return NextResponse.json({ success: true, template: resolved ? serialize(resolved) : null });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  if (!getEmailTemplateDef(params.key)) {
    return NextResponse.json(
      { success: false, error: "Template desconhecido." },
      { status: 404 }
    );
  }

  await resetTemplateOverride(params.key);
  const resolved = await resolveEmailTemplate(params.key);
  return NextResponse.json({ success: true, template: resolved ? serialize(resolved) : null });
}
