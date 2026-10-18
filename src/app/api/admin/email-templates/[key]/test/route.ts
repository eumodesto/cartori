import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { deliverEmail } from "@/lib/email";
import { renderTemplateDraft } from "@/lib/email-template-render";
import { getEmailTemplateDef } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validators";

/**
 * Envia o template com dados de exemplo para um e-mail de teste (o rascunho do editor, se houver).
 * Fica no registro de envios com o template "test:<chave>"; não conta como envio real.
 */
export async function POST(req: NextRequest, { params }: { params: { key: string } }) {
  const gate = await requirePlatformAdmin("admin.email");
  if (!gate.ok) return gate.response;

  const limit = rateLimit(`email-template-test:${gate.context.userId}`, 30, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: "Muitos testes seguidos. Espere alguns minutos." }, { status: 429 });
  }

  const def = getEmailTemplateDef(params.key);
  if (!def) return NextResponse.json({ success: false, error: "Template desconhecido." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const to = String(body.to || "").trim().toLowerCase();
  if (!isValidEmail(to)) {
    return NextResponse.json({ success: false, error: "Informe um e-mail válido." }, { status: 400 });
  }

  const rendered = await renderTemplateDraft(def, body);
  const subject = `[TESTE] ${rendered.subject}`;
  const row = await prisma.emailOutbox.create({
    data: { toEmail: to, toUserId: gate.context.userId, template: `test:${def.key}`, payload: { subject, text: rendered.body } },
  });
  const result = await deliverEmail(to, subject, rendered.body).catch((error: unknown) => ({
    sent: false as const,
    error: error instanceof Error ? error.message : "send_failed",
  }));
  await prisma.emailOutbox.update({
    where: { id: row.id },
    data: result.sent
      ? { status: "SENT", attempts: 1, sentAt: new Date() }
      : { status: "FAILED", attempts: 1, lastError: result.error },
  });

  if (!result.sent) {
    return NextResponse.json({ success: false, error: `Não enviado: ${result.error}` }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
