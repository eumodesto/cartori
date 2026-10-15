import { UserRole } from "@prisma/client";
import { queueTemplateEmail } from "@/lib/email";
import type { AdminNotificationCategory } from "@/lib/notification-prefs";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  B2B_INVOICE: "Faturado (B2B)",
};

/**
 * Avisa todos os ADMIN da plataforma sobre um evento do pedido.
 * Cada admin escolhe no perfil quais avisos recebe (preferência checada em queueTemplateEmail).
 * Nunca lança: aviso interno não pode quebrar checkout, webhook ou mensagem.
 */
export async function notifyAdmins(
  event: AdminNotificationCategory,
  orderId: string,
  extra: { messagePreview?: string } = {}
): Promise<void> {
  try {
    const [admins, order] = await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.ADMIN },
        select: { id: true, email: true },
      }),
      prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          protocol: true,
          customerName: true,
          customerEmail: true,
          totalAmount: true,
          items: { select: { certificateName: true, city: true, state: true } },
          payments: {
            select: { paymentMethod: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);
    if (!order || admins.length === 0) return;

    const base = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "");
    const method = order.payments[0]?.paymentMethod;
    const vars = {
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      protocol: order.protocol,
      total: formatCurrency(Number(order.totalAmount)),
      itemsList: order.items
        .map((item) => `- ${item.certificateName} (${item.city}/${item.state})`)
        .join("\n"),
      paymentMethod: method ? PAYMENT_METHOD_LABEL[method] || method : "—",
      messagePreview: (extra.messagePreview || "").slice(0, 500),
      adminOrderLink: `${base}/operacao/pedidos/${order.id}`,
    };

    await Promise.all(
      admins.map((admin) =>
        queueTemplateEmail({
          key: event,
          to: admin.email,
          toUserId: admin.id,
          orderId: order.id,
          vars,
        })
      )
    );
  } catch (error) {
    console.error("notifyAdmins falhou:", event, error);
  }
}
