import {
  createCardPayment,
  createPixPayment,
  isMercadoPagoConfigured,
  parseCardPaymentForm,
} from "@/lib/mercadopago";
import { StoredOrder, StoredPayment } from "@/lib/order-types";
import { saveOrder } from "@/lib/order-store";
import { createId, digitsOnly } from "@/lib/utils";
import { identificationType } from "@/lib/validators";

const pixLocks = new Map<string, Promise<StoredOrder>>();
const cardLocks = new Map<string, Promise<StoredOrder>>();

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    first: parts[0] || "Cliente",
    last: parts.slice(1).join(" ") || "",
  };
}

function checkoutPayer(order: StoredOrder) {
  const name = splitName(order.customerName);
  return {
    email: order.customerEmail,
    first_name: name.first,
    last_name: name.last,
    identification: {
      type: identificationType(order.customerCpfCnpj),
      number: digitsOnly(order.customerCpfCnpj),
    },
  };
}

export function isCardPayment(order: StoredOrder): boolean {
  return order.payment?.paymentMethod === "CREDIT_CARD";
}

export function hasLivePix(order: StoredOrder): boolean {
  const payment = order.payment;
  if (!payment?.qrCode) return false;
  if (payment.demo) return false;
  if (payment.providerPaymentId?.startsWith("demo-")) return false;
  if (/^CARTORI-.+-DEMO$/i.test(payment.qrCode)) return false;
  return Boolean(payment.qrCodeBase64) || payment.qrCode.startsWith("000201");
}

function paymentStatusFromMp(status?: string): StoredPayment["status"] {
  if (status === "approved") return "APPROVED";
  if (status === "rejected") return "REJECTED";
  if (status === "cancelled") return "CANCELLED";
  return "PENDING";
}

export async function issuePixForOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  if (!isMercadoPagoConfigured()) {
    throw new Error(
      "Mercado Pago não está configurado. Defina MERCADOPAGO_ACCESS_TOKEN."
    );
  }

  const pix = await createPixPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    description: `Cartori ${order.protocol}`,
    payer: checkoutPayer(order),
  });

  const payment: StoredPayment = {
    id: order.payment?.id || createId(),
    provider: "MERCADOPAGO",
    providerPaymentId: pix.paymentId,
    paymentMethod: "PIX",
    status: pix.status === "approved" ? "APPROVED" : "PENDING",
    amount: order.totalAmount,
    qrCode: pix.qrCode,
    qrCodeBase64: pix.qrCodeBase64,
    ticketUrl: pix.ticketUrl,
    demo: false,
  };

  const next: StoredOrder = {
    ...order,
    payment,
    status: payment.status === "APPROVED" ? "PAID" : "PENDING_PAYMENT",
    updatedAt: new Date().toISOString(),
  };

  return saveOrder(next);
}

export async function prepareCardOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  const payment: StoredPayment = {
    id: order.payment?.id || createId(),
    provider: "MERCADOPAGO",
    providerPaymentId: order.payment?.providerPaymentId,
    paymentMethod: "CREDIT_CARD",
    status: "PENDING",
    amount: order.totalAmount,
    demo: false,
  };

  return saveOrder({
    ...order,
    payment,
    status: "PENDING_PAYMENT",
    updatedAt: new Date().toISOString(),
  });
}

export async function chargeCardForOrder(
  order: StoredOrder,
  cardBody: unknown
): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  if (!isMercadoPagoConfigured()) {
    throw new Error(
      "Mercado Pago não está configurado. Defina MERCADOPAGO_ACCESS_TOKEN."
    );
  }

  const card = parseCardPaymentForm(cardBody);
  const charged = await createCardPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    description: `Cartori ${order.protocol}`,
    payer: checkoutPayer(order),
    ...card,
  });

  const status = paymentStatusFromMp(charged.status);
  if (status === "REJECTED" || status === "CANCELLED") {
    throw new Error(
      charged.statusDetail
        ? `Pagamento recusado (${charged.statusDetail}). Confira os dados do cartão e tente de novo.`
        : "Pagamento recusado. Confira os dados do cartão e tente de novo."
    );
  }

  const payment: StoredPayment = {
    id: order.payment?.id || createId(),
    provider: "MERCADOPAGO",
    providerPaymentId: charged.paymentId,
    paymentMethod: "CREDIT_CARD",
    status,
    amount: order.totalAmount,
    demo: false,
  };

  return saveOrder({
    ...order,
    payment,
    status: status === "APPROVED" ? "PAID" : "PENDING_PAYMENT",
    updatedAt: new Date().toISOString(),
  });
}

export async function ensurePixForOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID" || isCardPayment(order) || hasLivePix(order)) return order;

  const pending = pixLocks.get(order.id);
  if (pending) return pending;

  const task = issuePixForOrder(order).finally(() => {
    pixLocks.delete(order.id);
  });
  pixLocks.set(order.id, task);
  return task;
}

export async function ensureCardChargeForOrder(
  order: StoredOrder,
  cardBody: unknown
): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  const pending = cardLocks.get(order.id);
  if (pending) return pending;

  const task = chargeCardForOrder(order, cardBody).finally(() => {
    cardLocks.delete(order.id);
  });
  cardLocks.set(order.id, task);
  return task;
}

export async function markOrderPaid(order: StoredOrder): Promise<StoredOrder> {
  const now = new Date().toISOString();
  const next: StoredOrder = {
    ...order,
    status: "PAID",
    payment: order.payment
      ? { ...order.payment, status: "APPROVED" }
      : order.payment,
    updatedAt: now,
  };
  return saveOrder(next);
}
