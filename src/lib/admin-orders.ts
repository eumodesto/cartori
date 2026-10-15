import { PaymentStatus } from "@prisma/client";
import { staffTransitionTargets } from "@/lib/authorization-policy";
import {
  MANUAL_PAYMENT_PROVIDER,
  manualPaymentActions,
  type ManualPaymentAction,
} from "@/lib/manual-payment";
import { displayOrderStatus, type DisplayOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export type AdminUserOrder = {
  id: string;
  protocol: string;
  status: string;
  paymentStatus: string | null;
  manualPayment: boolean;
  display: DisplayOrderStatus;
  totalAmount: number;
  createdAt: string;
  certificates: string[];
  documentTargets: string[];
  paymentActions: ManualPaymentAction[];
};

/** Pedidos do usuário (B2C: order.userId) com as mudanças de status permitidas agora. */
export async function listAdminUserOrders(userId: string): Promise<AdminUserOrder[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      protocol: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: { select: { certificateName: true } },
      payments: {
        select: { status: true, provider: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return orders.map((order) => {
    const latest = order.payments[0] ?? null;
    const hasApprovedPayment = order.payments.some((p) => p.status === PaymentStatus.APPROVED);
    return {
      id: order.id,
      protocol: order.protocol,
      status: order.status,
      paymentStatus: latest?.status ?? null,
      manualPayment: latest?.provider === MANUAL_PAYMENT_PROVIDER,
      display: displayOrderStatus(order.status, latest?.status),
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      certificates: order.items.map((item) => item.certificateName),
      documentTargets: staffTransitionTargets(order.status, { hasApprovedPayment }),
      paymentActions: manualPaymentActions(order),
    };
  });
}
