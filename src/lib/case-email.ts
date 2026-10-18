import { prisma } from "@/lib/prisma";
import { deliverEmail, queueTemplateEmail } from "@/lib/email";
import { orderStatusTemplateKey } from "@/lib/email-templates";
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
  return `${base || "https://www.interjuri.com.br"}${path}`;
}

function renderEmail(input: QueueInput) {
  const link = appUrl(`/painel/pedidos/${input.orderId}`);
  if (input.template === "status_changed") {
    return {
      subject: `InterJuri · pedido ${input.protocol} atualizado`,
      text: `O status do pedido ${input.protocol} mudou para ${input.statusLabel || "atualizado"}.\n\nAbra o painel para ver a mensagem e enviar documentos se for preciso:\n${link}\n`,
    };
  }
  if (input.template === "attachment_uploaded") {
    return {
      subject: `InterJuri · novo arquivo no pedido ${input.protocol}`,
      text: `Há um novo arquivo no pedido ${input.protocol}.\n\nAbra o painel:\n${link}\n`,
    };
  }
  return {
    subject: `InterJuri · mensagem no pedido ${input.protocol}`,
    text: `${input.preview || "Há uma nova mensagem no seu pedido."}\n\nResponda ou envie documentos no painel:\n${link}\n`,
  };
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
    const result = await deliverEmail(email, rendered.subject, rendered.text);
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

export async function queueOrderStatusEmail(
  order: {
    id: string;
    protocol: string;
    customerName: string;
    customerEmail: string;
    userId: string | null;
  },
  status: string
) {
  return queueTemplateEmail({
    key: orderStatusTemplateKey(status),
    to: order.customerEmail,
    toUserId: order.userId,
    orderId: order.id,
    vars: {
      customerName: order.customerName,
      protocol: order.protocol,
      statusLabel: statusLabelForEmail(status),
      orderLink: appUrl(`/painel/pedidos/${order.id}`),
    },
  });
}

export type CustomerPaymentEvent = "approved" | "rejected" | "refunded";

const PAYMENT_EVENT_TEMPLATE: Record<CustomerPaymentEvent, string> = {
  approved: orderStatusTemplateKey("PAID"),
  rejected: "payment_rejected",
  refunded: "payment_refunded",
};

/** Avisa o cliente do resultado do pagamento (Mercado Pago ou registro manual). Nunca lança. */
export async function notifyCustomerPayment(orderId: string, event: CustomerPaymentEvent) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, protocol: true, customerName: true, customerEmail: true, userId: true },
    });
    if (!order) return null;
    return await queueTemplateEmail({
      key: PAYMENT_EVENT_TEMPLATE[event],
      to: order.customerEmail,
      toUserId: order.userId,
      orderId: order.id,
      vars: {
        customerName: order.customerName,
        protocol: order.protocol,
        statusLabel: event === "approved" ? statusLabelForEmail("PAID") : "",
        orderLink: appUrl(`/painel/pedidos/${order.id}`),
      },
    });
  } catch (error) {
    console.error("notifyCustomerPayment falhou:", event, error);
    return null;
  }
}
