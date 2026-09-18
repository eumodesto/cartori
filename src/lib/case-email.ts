import { prisma } from "@/lib/prisma";
import { orderStatusMeta } from "@/lib/order-status";

type CaseMailTemplate = "status_changed" | "new_message" | "attachment_uploaded";

type QueueInput = {
  orderId: string;
  toEmail: string;
  toUserId?: string | null;
  template: CaseMailTemplate;
  protocol: string;
  preview?: string;
  statusLabel?: string;
};

function appUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return `${base || "https://cartori.vercel.app"}${path}`;
}

function renderEmail(input: QueueInput) {
  const link = appUrl(`/dashboard/solicitacoes/${input.orderId}`);
  if (input.template === "status_changed") {
    return {
      subject: `Cartori · pedido ${input.protocol} atualizado`,
      text: `O status do pedido ${input.protocol} mudou para ${input.statusLabel || "atualizado"}.\n\nAbra o painel para ver a mensagem e enviar documentos se for preciso:\n${link}\n`,
    };
  }
  if (input.template === "attachment_uploaded") {
    return {
      subject: `Cartori · novo arquivo no pedido ${input.protocol}`,
      text: `Há um novo arquivo no pedido ${input.protocol}.\n\nAbra o painel:\n${link}\n`,
    };
  }
  return {
    subject: `Cartori · mensagem no pedido ${input.protocol}`,
    text: `${input.preview || "Há uma nova mensagem no seu pedido."}\n\nResponda ou envie documentos no painel:\n${link}\n`,
  };
}

async function deliver(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY || "";
  const from = process.env.EMAIL_FROM || "";
  if (!key || !from || from.includes("placeholder")) {
    return { sent: false as const, error: "EMAIL_FROM / RESEND_API_KEY ausentes" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    return { sent: false as const, error: `${res.status} ${body}` };
  }
  return { sent: true as const };
}

export async function queueCaseEmail(input: QueueInput) {
  const email = input.toEmail.trim().toLowerCase();
  if (!email) return null;

  const rendered = renderEmail(input);
  const row = await prisma.emailOutbox.create({
    data: {
      orderId: input.orderId,
      toEmail: email,
      toUserId: input.toUserId || null,
      template: input.template,
      payload: {
        protocol: input.protocol,
        preview: input.preview || null,
        statusLabel: input.statusLabel || null,
        subject: rendered.subject,
        text: rendered.text,
      },
    },
  });

  try {
    const result = await deliver(email, rendered.subject, rendered.text);
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
}

export function statusLabelForEmail(status: string) {
  return orderStatusMeta(status).label;
}
