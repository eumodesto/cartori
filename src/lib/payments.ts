import {
  createCardPayment,
  createPixPayment,
  isMercadoPagoConfigured,
  parseCardPaymentForm,
} from "@/lib/mercadopago";
import { chargeAmountNumber } from "@/lib/money-cents";
import { StoredOrder, StoredPayment } from "@/lib/order-types";
import {
  getOrderById,
  getOrderChargeAmount,
  getOwnedOrder,
  saveOrder,
} from "@/lib/order-store";
import { reconcileMercadoPagoPayment } from "@/lib/payment-reconcile";
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

async function serverChargeAmount(order: StoredOrder) {
  const total = await getOrderChargeAmount(order.id);
  if (!total) {
    throw new Error("Pedido não encontrado para cobrança.");
  }
  return {
    decimal: total,
    number: chargeAmountNumber(total),
  };
}

async function persistChargeThenReconcile(next: StoredOrder): Promise<StoredOrder> {
  const saved = await saveOrder(next);
  const providerPaymentId = saved.payment?.providerPaymentId;
  if (!providerPaymentId) return saved;
  await reconcileMercadoPagoPayment(providerPaymentId);
  const refreshed = saved.userId
    ? await getOwnedOrder(saved.id, saved.userId)
    : await getOrderById(saved.id);
  return refreshed || saved;
}

export async function issuePixForOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  if (!isMercadoPagoConfigured()) {
    throw new Error(
      "Mercado Pago não está configurado. Defina MERCADOPAGO_ACCESS_TOKEN."
    );
  }

  const amount = await serverChargeAmount(order);
  const pix = await createPixPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: amount.number,
    description: `Cartori ${order.protocol}`,
    payer: checkoutPayer(order),
  });

  const payment: StoredPayment = {
    id: order.payment?.id || createId(),
    provider: "MERCADOPAGO",
    providerPaymentId: pix.paymentId,
    paymentMethod: "PIX",
    status: "PENDING",
    amount: amount.number,
    qrCode: pix.qrCode,
    qrCodeBase64: pix.qrCodeBase64,
    ticketUrl: pix.ticketUrl,
    demo: false,
  };

  return persistChargeThenReconcile({
    ...order,
    payment,
    totalAmount: amount.number,
    status: "PENDING_PAYMENT",
    updatedAt: new Date().toISOString(),
  });
}

export async function prepareCardOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  const amount = await serverChargeAmount(order);
  const payment: StoredPayment = {
    id: order.payment?.id || createId(),
    provider: "MERCADOPAGO",
    providerPaymentId: order.payment?.providerPaymentId,
    paymentMethod: "CREDIT_CARD",
    status: "PENDING",
    amount: amount.number,
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
  const amount = await serverChargeAmount(order);
  const charged = await createCardPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: amount.number,
    description: `Cartori ${order.protocol}`,
    payer: checkoutPayer(order),
    ...card,
  });

  if (charged.status === "rejected" || charged.status === "cancelled") {
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
    status: "PENDING",
    amount: amount.number,
    demo: false,
  };

  return persistChargeThenReconcile({
    ...order,
    payment,
    totalAmount: amount.number,
    status: "PENDING_PAYMENT",
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

