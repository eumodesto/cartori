import { prisma } from "@/lib/prisma";
import { resolveEmailCredentials, resolveEmailTemplate } from "@/lib/email-settings";
import { renderTemplateString } from "@/lib/email-templates";

export type DeliveryResult = { sent: true } | { sent: false; error: string };

/** Envio via Resend usando credenciais resolvidas (banco → env). Server-only. */
export async function deliverEmail(
  to: string,
  subject: string,
  text: string
): Promise<DeliveryResult> {
  const { apiKey, from } = await resolveEmailCredentials();
  if (!apiKey || !from || from.includes("placeholder")) {
    return { sent: false, error: "EMAIL_FROM / RESEND_API_KEY ausentes" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    return { sent: false, error: `${res.status} ${body}` };
  }
  return { sent: true };
}

/**
 * Renderiza um template (override ou default), grava na EmailOutbox e tenta enviar.
 * Nunca lança: falhas ficam registradas na outbox (PENDING/FAILED). Retorna o id ou null.
 */
export async function queueTemplateEmail(input: {
  key: string;
  to: string;
  toUserId?: string | null;
  orderId?: string | null;
  vars: Record<string, string | number | null | undefined>;
}): Promise<string | null> {
  try {
    const email = input.to.trim().toLowerCase();
    if (!email) return null;

    const resolved = await resolveEmailTemplate(input.key);
    if (!resolved || !resolved.active) return null;

    const subject = renderTemplateString(resolved.subject, input.vars);
    const text = renderTemplateString(resolved.body, input.vars);

    const row = await prisma.emailOutbox.create({
      data: {
        orderId: input.orderId || null,
        toEmail: email,
        toUserId: input.toUserId || null,
        template: input.key,
        payload: { subject, text, source: resolved.source },
      },
    });

    try {
      const result = await deliverEmail(email, subject, text);
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: result.sent
          ? { status: "SENT", attempts: { increment: 1 }, sentAt: new Date(), lastError: null }
          : { status: "PENDING", attempts: { increment: 1 }, lastError: result.error },
      });
    } catch (error) {
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : "send_failed",
        },
      });
    }

    return row.id;
  } catch (error) {
    console.error("queueTemplateEmail falhou:", error);
    return null;
  }
}

/** Renderiza subject/body de um template para preview (sem enviar). */
export async function renderTemplatePreview(
  key: string,
  vars: Record<string, string | number | null | undefined>
): Promise<{ subject: string; body: string } | null> {
  const resolved = await resolveEmailTemplate(key);
  if (!resolved) return null;
  return {
    subject: renderTemplateString(resolved.subject, vars),
    body: renderTemplateString(resolved.body, vars),
  };
}
