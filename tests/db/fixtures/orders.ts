import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { MercadoPagoPaymentSnapshot } from "@/lib/payment-reconcile";
import type { StoredOrder } from "@/lib/order-types";

const createdOrderIds = new Set<string>();

/** Passo 10 evita colisão com `nextOrderNumber()` (máximo + 1). */
let orderNumberCursor = 1_500_000_000 + (Date.now() % 50_000_000) * 10;

export async function cleanupOrders() {
  if (createdOrderIds.size) {
    await prisma.order.deleteMany({ where: { id: { in: [...createdOrderIds] } } });
    createdOrderIds.clear();
  }
}

export function makeStoredOrder(overrides: Partial<StoredOrder> = {}): StoredOrder {
  const id = overrides.id ?? randomUUID();
  orderNumberCursor += 10;
  createdOrderIds.add(id);
  const now = new Date().toISOString();
  return {
    id,
    orderNumber: orderNumberCursor,
    protocol: `TESTE-${id}`,
    channel: "CARTORI",
    kind: "OWN",
    sellerOrgId: null,
    userId: null,
    organizationId: null,
    status: "PENDING_PAYMENT",
    totalAmount: 105.9,
    itemsTotal: 105.9,
    shippingTotal: 0,
    discountTotal: 0,
    customerName: "Cliente Sintético",
    customerEmail: `pedido.${id}@example.invalid`,
    customerPhone: "11900000000",
    customerCpfCnpj: "00000000000",
    isCompany: false,
    items: [
      {
        id: randomUUID(),
        category: "registro-civil",
        certificateType: "certidao-nascimento",
        certificateName: "Certidão de Nascimento",
        state: "SP",
        city: "São Paulo",
        cartorioId: "cartorio-inexistente",
        cartorioName: "Cartório de Teste",
        isUnknownCartorio: false,
        documentData: { nome: "Titular Sintético" },
        format: "DIGITAL_ECERTIDAO",
        hasApostille: false,
        hasShipping: false,
        listPrice: 105.9,
        itemPrice: 105.9,
        searchFee: 0,
        apostilleFee: 0,
        shippingPrice: 0,
        totalPrice: 105.9,
      },
    ],
    payment: {
      id: randomUUID(),
      provider: "MERCADOPAGO",
      providerPaymentId: `mp-teste-${randomUUID()}`,
      paymentMethod: "PIX",
      status: "PENDING",
      amount: 105.9,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function approvedSnapshot(
  order: StoredOrder,
  overrides: Partial<MercadoPagoPaymentSnapshot> = {}
): MercadoPagoPaymentSnapshot {
  return {
    id: order.payment!.providerPaymentId!,
    status: "approved",
    currencyId: "BRL",
    transactionAmount: order.totalAmount,
    externalReference: order.id,
    metadataOrderId: order.id,
    ...overrides,
  };
}

export async function readOrderState(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { payments: true, items: true },
  });
  return {
    status: order.status,
    payments: order.payments,
    items: order.items,
    paymentStatus: order.payments[0]?.status,
  };
}
