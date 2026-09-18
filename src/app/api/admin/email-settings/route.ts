import { NextRequest, NextResponse } from "next/server";
import { requireUserManagement } from "@/lib/admin-users";
import { getEmailSettingsView, saveEmailSettings } from "@/lib/email-settings";
import { isValidEmail } from "@/lib/validators";

export async function GET() {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const settings = await getEmailSettingsView();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(req: NextRequest) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => ({}));
  const patch: { resendApiKey?: string; fromEmail?: string } = {};

  if (typeof body.resendApiKey === "string" && body.resendApiKey.trim()) {
    patch.resendApiKey = body.resendApiKey.trim();
  }
  if (typeof body.fromEmail === "string") {
    const from = body.fromEmail.trim();
    if (from && !isValidEmail(from)) {
      return NextResponse.json(
        { success: false, error: "E-mail remetente inválido." },
        { status: 400 }
      );
    }
    patch.fromEmail = from;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { success: false, error: "Nada para atualizar." },
      { status: 400 }
    );
  }

  await saveEmailSettings(patch);
  const settings = await getEmailSettingsView();
  return NextResponse.json({ success: true, settings });
}
