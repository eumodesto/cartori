import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { listOutbox, resendOutbox, sendTestEmail, unsentOutboxIds } from "@/lib/email-outbox";
import { isValidEmail } from "@/lib/validators";

/** Registro de envios. Mesma permissão da área de e-mails (emails). */
export async function GET() {
  const gate = await requirePlatformAdmin("admin.email.outbox");
  if (!gate.ok) return gate.response;
  const { rows, counts } = await listOutbox();
  return NextResponse.json({ success: true, rows, counts });
}

/**
 * - { action: "resend", ids: [...] } reenvia os selecionados (enviados são ignorados);
 * - { action: "resend_unsent" } reenvia até 50 pendentes ou com falha;
 * - { action: "test", to } envia um e-mail de teste.
 */
export async function POST(req: NextRequest) {
  const gate = await requirePlatformAdmin("admin.email.outbox");
  if (!gate.ok) return gate.response;

  const body = (await req.json().catch(() => ({}))) as { action?: unknown; ids?: unknown; to?: unknown };

  if (body.action === "test") {
    const to = String(body.to || "").trim().toLowerCase();
    if (!isValidEmail(to)) {
      return NextResponse.json({ success: false, error: "Informe um e-mail válido." }, { status: 400 });
    }
    const result = await sendTestEmail(to);
    return NextResponse.json(
      result.sent
        ? { success: true }
        : { success: false, error: `Não enviado: ${result.error}` },
      { status: result.sent ? 200 : 502 }
    );
  }

  if (body.action === "resend" || body.action === "resend_unsent") {
    const ids =
      body.action === "resend_unsent"
        ? await unsentOutboxIds()
        : Array.isArray(body.ids)
          ? body.ids.filter((id): id is string => typeof id === "string")
          : [];
    if (!ids.length) {
      return NextResponse.json({ success: false, error: "Nada para reenviar." }, { status: 400 });
    }
    const result = await resendOutbox(ids);
    return NextResponse.json({ success: true, ...result });
  }

  return NextResponse.json({ success: false, error: "Ação inválida." }, { status: 400 });
}
