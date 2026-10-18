import { EmailOutboxStatus, Prisma } from "@prisma/client";
import { deliverEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/** Registro de envios (EmailOutbox): leitura, reenvio e e-mail de teste. Server-only. */

export const OUTBOX_PAGE = 200;
export const RESEND_LIMIT = 50;

export type OutboxRow = {
  id: string;
  toEmail: string;
  template: string;
  subject: string;
  status: EmailOutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
  orderId: string | null;
  protocol: string | null;
};

function payloadOf(value: Prisma.JsonValue): { subject?: string; text?: string; sensitive?: boolean } {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as { subject?: string; text?: string; sensitive?: boolean })
    : {};
}

export async function listOutbox(): Promise<{ rows: OutboxRow[]; counts: Record<EmailOutboxStatus, number> }> {
  const [rows, grouped] = await Promise.all([
    prisma.emailOutbox.findMany({
      orderBy: { createdAt: "desc" },
      take: OUTBOX_PAGE,
      select: {
        id: true,
        toEmail: true,
        template: true,
        payload: true,
        status: true,
        attempts: true,
        lastError: true,
        createdAt: true,
        sentAt: true,
        orderId: true,
        order: { select: { protocol: true } },
      },
    }),
    prisma.emailOutbox.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts = { PENDING: 0, SENT: 0, FAILED: 0 } as Record<EmailOutboxStatus, number>;
  for (const row of grouped) counts[row.status] = row._count._all;
  return {
    counts,
    rows: rows.map((row) => ({
      id: row.id,
      toEmail: row.toEmail,
      template: row.template,
      subject: payloadOf(row.payload).subject || row.template,
      status: row.status,
      attempts: row.attempts,
      lastError: row.lastError,
      createdAt: row.createdAt.toISOString(),
      sentAt: row.sentAt?.toISOString() ?? null,
      orderId: row.orderId,
      protocol: row.order?.protocol ?? null,
    })),
  };
}

/** Reenvia com o assunto e o texto gravados no envio original. Enviado não é reenviado. */
export async function resendOutbox(ids: string[]) {
  const rows = await prisma.emailOutbox.findMany({
    where: { id: { in: ids.slice(0, RESEND_LIMIT) }, status: { not: "SENT" } },
    select: { id: true, toEmail: true, payload: true },
  });
  let sent = 0;
  const failed: Array<{ id: string; error: string }> = [];
  for (const row of rows) {
    const { subject, text, sensitive } = payloadOf(row.payload);
    if (sensitive) {
      // Link de acesso não fica salvo: a pessoa pede um novo (cadastro, senha ou troca de e-mail).
      failed.push({ id: row.id, error: "e-mail de acesso não é reenviado; a pessoa deve pedir um novo link" });
      continue;
    }
    if (!subject || !text) {
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: { status: "FAILED", lastError: "registro sem assunto ou texto" },
      });
      failed.push({ id: row.id, error: "registro sem assunto ou texto" });
      continue;
    }
    try {
      const result = await deliverEmail(row.toEmail, subject, text);
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: result.sent
          ? { status: "SENT", attempts: { increment: 1 }, sentAt: new Date(), lastError: null }
          : { status: "FAILED", attempts: { increment: 1 }, lastError: result.error },
      });
      if (result.sent) sent += 1;
      else failed.push({ id: row.id, error: result.error });
    } catch (error) {
      const message = error instanceof Error ? error.message : "send_failed";
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: { status: "FAILED", attempts: { increment: 1 }, lastError: message },
      });
      failed.push({ id: row.id, error: message });
    }
  }
  return { sent, failed, skipped: ids.length - rows.length };
}

/** Ids pendentes ou com falha, do mais antigo ao mais novo, para "reenviar todos". */
export async function unsentOutboxIds() {
  const rows = await prisma.emailOutbox.findMany({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { createdAt: "asc" },
    take: RESEND_LIMIT,
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

/** E-mail de teste com o layout da marca, registrado na outbox como os demais. */
export async function sendTestEmail(to: string) {
  const subject = "InterJuri · e-mail de teste";
  const text =
    "Este é um e-mail de teste enviado pela área de E-mails da InterJuri.\n\nSe ele chegou, o envio está funcionando: remetente, chave do Resend e layout.";
  const row = await prisma.emailOutbox.create({
    data: { toEmail: to, template: "test", payload: { subject, text } },
  });
  const result = await deliverEmail(to, subject, text).catch((error: unknown) => ({
    sent: false as const,
    error: error instanceof Error ? error.message : "send_failed",
  }));
  await prisma.emailOutbox.update({
    where: { id: row.id },
    data: result.sent
      ? { status: "SENT", attempts: 1, sentAt: new Date() }
      : { status: "FAILED", attempts: 1, lastError: result.error },
  });
  return result;
}
