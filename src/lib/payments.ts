import { createPixPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { StoredOrder, StoredPayment } from "@/lib/order-types";
import { saveOrder } from "@/lib/order-store";
import { createId, digitsOnly } from "@/lib/utils";
import { identificationType } from "@/lib/validators";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    first: parts[0] || "Cliente",
    last: parts.slice(1).join(" ") || "",
  };
}

export async function issuePixForOrder(order: StoredOrder): Promise<StoredOrder> {
  if (order.status === "PAID") return order;

  const name = splitName(order.customerName);
  const now = new Date().toISOString();
  let payment: StoredPayment;

  if (isMercadoPagoConfigured()) {
    const pix = await createPixPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      description: `Cartori ${order.protocol}`,
      payer: {
        email: order.customerEmail,
        first_name: name.first,
        last_name: name.last,
        identification: {
          type: identificationType(order.customerCpfCnpj),
          number: digitsOnly(order.customerCpfCnpj),
        },
      },
    });

    payment = {
      id: createId(),
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
  } else {
    payment = {
      id: createId(),
      provider: "MERCADOPAGO",
      providerPaymentId: `demo-${order.id}`,
      paymentMethod: "PIX",
      status: "PENDING",
      amount: order.totalAmount,
      qrCode: `CARTORI-${order.protocol}-DEMO`,
      qrCodeBase64: "",
      ticketUrl: "",
      demo: true,
    };
  }

  const next: StoredOrder = {
    ...order,
    payment,
    status: payment.status === "APPROVED" ? "PAID" : "PENDING_PAYMENT",
    updatedAt: now,
  };

  return saveOrder(next);
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
