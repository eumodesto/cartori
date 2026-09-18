import { NextResponse } from "next/server";
import { requireUserManagement } from "@/lib/admin-users";
import { listResolvedTemplates } from "@/lib/email-settings";

export async function GET() {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const resolved = await listResolvedTemplates();
  const templates = resolved.map((t) => ({
    key: t.key,
    group: t.def.group,
    label: t.def.label,
    description: t.def.description,
    status: t.def.status ?? null,
    subject: t.subject,
    body: t.body,
    variables: t.def.variables,
    source: t.source,
  }));
  return NextResponse.json({ success: true, templates });
}
