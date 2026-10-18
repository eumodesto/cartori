import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { getEmailSettingsView, saveEmailSettings } from "@/lib/email-settings";
import { isValidEmail } from "@/lib/validators";

const WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "bol.com.br",
  "uol.com.br",
  "terra.com.br",
]);

export async function GET() {
  const gate = await requirePlatformAdmin("admin.email");
  if (!gate.ok) return gate.response;

  const settings = await getEmailSettingsView();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(req: NextRequest) {
  const gate = await requirePlatformAdmin("admin.email");
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => ({}));
  const patch: { resendApiKey?: string; fromEmail?: string } = {};

  if (typeof body.resendApiKey === "string" && body.resendApiKey.trim()) {
    patch.resendApiKey = body.resendApiKey.trim();
  }
  if (typeof body.fromEmail === "string") {
    const from = body.fromEmail.trim();
    // Aceita "e-mail" ou "Nome <e-mail>" (formato do Resend).
    const address = (from.match(/<([^>]+)>\s*$/)?.[1] ?? from).trim().toLowerCase();
    if (from && !isValidEmail(address)) {
      return NextResponse.json(
        { success: false, error: "E-mail remetente inválido. Use e-mail ou Nome <e-mail>." },
        { status: 400 }
      );
    }
    // O Resend só envia de domínio verificado; webmail (gmail, hotmail…) nunca é verificável.
    const domain = address.split("@")[1] ?? "";
    if (from && WEBMAIL_DOMAINS.has(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: `O remetente precisa ser do seu domínio verificado no Resend (ex.: nao-responda@interjuri.com.br), não @${domain}.`,
        },
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
