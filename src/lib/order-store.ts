import {
  CertificateFormat,
  OrderChannel,
  OrderKind,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { findExistingCartorioIds } from "@/lib/cartorios";
import { prisma } from "@/lib/prisma";
import {
  StoredOrder,
  StoredOrderItem,
  StoredOrderStatus,
  StoredPayment,
  StoredPaymentMethod,
  StoredPaymentStatus,
} from "@/lib/order-types";

type OrderRecord = Prisma.OrderGetPayload<{
  include: { items: true; payments: true };
}>;

function money(value: Prisma.Decimal | number | string | null | undefined): number {
  return Number(value ?? 0);
}

function toStoredStatus(status: OrderStatus): StoredOrderStatus {
  return status;
}

/** Mapas exaustivos: um valor novo no enum do Prisma quebra a compilação aqui. */
const STORED_PAYMENT_STATUS: Record<PaymentStatus, StoredPaymentStatus> = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  IN_PROCESS: "IN_PROCESS",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

const PRISMA_PAYMENT_STATUS: Record<StoredPaymentStatus, PaymentStatus> = {
  PENDING: PaymentStatus.PENDING,
  APPROVED: PaymentStatus.APPROVED,
  IN_PROCESS: PaymentStatus.IN_PROCESS,
  REJECTED: PaymentStatus.REJECTED,
  CANCELLED: PaymentStatus.CANCELLED,
  REFUNDED: PaymentStatus.REFUNDED,
};

const STORED_PAYMENT_METHOD: Record<PaymentMethod, StoredPaymentMethod> = {
  PIX: "PIX",
  CREDIT_CARD: "CREDIT_CARD",
  BOLETO: "BOLETO",
  B2B_INVOICE: "B2B_INVOICE",
};

const PRISMA_PAYMENT_METHOD: Record<StoredPaymentMethod, PaymentMethod> = {
  PIX: PaymentMethod.PIX,
  CREDIT_CARD: PaymentMethod.CREDIT_CARD,
  BOLETO: PaymentMethod.BOLETO,
  B2B_INVOICE: PaymentMethod.B2B_INVOICE,
};

export function toStoredPaymentStatus(status: PaymentStatus): StoredPaymentStatus {
  return STORED_PAYMENT_STATUS[status];
}

export function toPrismaPaymentStatus(status: StoredPaymentStatus): PaymentStatus {
  return PRISMA_PAYMENT_STATUS[status];
}

export function toStoredPaymentMethod(method: PaymentMethod): StoredPaymentMethod {
  return STORED_PAYMENT_METHOD[method];
}

export function toPrismaPaymentMethod(method: StoredPaymentMethod): PaymentMethod {
  return PRISMA_PAYMENT_METHOD[method];
}

function latestPayment(payments: Payment[]): Payment | null {
  if (!payments.length) return null;
  return [...payments].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0];
}

function toStoredPayment(payment: Payment | null): StoredPayment | null {
  if (!payment) return null;
  const demo = Boolean(
    payment.metadata &&
      typeof payment.metadata === "object" &&
      !Array.isArray(payment.metadata) &&
      (payment.metadata as Record<string, unknown>).demo === true
  );

  return {
    id: payment.id,
    provider: "MERCADOPAGO",
    providerPaymentId: payment.providerPaymentId || undefined,
    paymentMethod: toStoredPaymentMethod(payment.paymentMethod),
    status: toStoredPaymentStatus(payment.status),
    amount: money(payment.amount),
    qrCode: payment.qrCode || undefined,
    qrCodeBase64: payment.qrCodeBase64 || undefined,
    ticketUrl: payment.ticketUrl || undefined,
    demo,
  };
}

function toStoredItem(item: OrderRecord["items"][number]): StoredOrderItem {
  const documentData =
    item.documentData && typeof item.documentData === "object"
      ? (item.documentData as Record<string, string>)
      : {};

  return {
    id: item.id,
    category: item.category,
    certificateType: item.certificateType,
    certificateName: item.certificateName,
    state: item.state,
    city: item.city,
    cartorioId: item.cartorioId || undefined,
    cartorioName: item.cartorioName || undefined,
    isUnknownCartorio: item.isUnknownCartorio,
    documentData,
    format: item.format,
    hasApostille: item.hasApostille,
    hasShipping: item.hasShipping,
    listPrice: money(item.listPrice),
    itemPrice: money(item.itemPrice),
    searchFee: money(item.searchFee),
    apostilleFee: money(item.apostilleFee),
    shippingPrice: money(item.shippingPrice),
    totalPrice: money(item.totalPrice),
    referenceTag: item.referenceTag || undefined,
    estimatedDays: item.estimatedDays || undefined,
  };
}

function toStoredOrder(order: OrderRecord): StoredOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    protocol: order.protocol,
    channel: order.channel === "PARTNER" ? "PARTNER" : "CARTORI",
    kind: order.kind === "RESELL" ? "RESELL" : "OWN",
    sellerOrgId: order.sellerOrgId,
    userId: order.userId,
    organizationId: order.organizationId,
    status: toStoredStatus(order.status),
    totalAmount: money(order.totalAmount),
    itemsTotal: money(order.itemsTotal),
    shippingTotal: money(order.shippingTotal),
    discountTotal: money(order.discountTotal),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerCpfCnpj: order.customerCpfCnpj,
    isCompany: order.isCompany,
    companyName: order.companyName || undefined,
    oabOrCreci: order.oabOrCreci || undefined,
    shippingCep: order.shippingCep || undefined,
    shippingStreet: order.shippingStreet || undefined,
    shippingNumber: order.shippingNumber || undefined,
    shippingComplement: order.shippingComplement || undefined,
    shippingDistrict: order.shippingDistrict || undefined,
    shippingCity: order.shippingCity || undefined,
    shippingState: order.shippingState || undefined,
    items: order.items.map(toStoredItem),
    payment: toStoredPayment(latestPayment(order.payments)),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

const orderInclude = {
  items: true,
  payments: true,
} satisfies Prisma.OrderInclude;

export async function listOrdersByUser(userId: string): Promise<StoredOrder[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toStoredOrder);
}

export async function getOwnedOrder(
  id: string,
  userId: string
): Promise<StoredOrder | null> {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });
  return order ? toStoredOrder(order) : null;
}

export async function getOrderById(id: string): Promise<StoredOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  return order ? toStoredOrder(order) : null;
}

export async function nextOrderNumber(): Promise<number> {
  const aggregate = await prisma.order.aggregate({
    _max: { orderNumber: true },
  });
  return Math.max(1000, aggregate._max.orderNumber ?? 1000) + 1;
}

export async function saveOrder(order: StoredOrder): Promise<StoredOrder> {
  const status = order.status as OrderStatus;
  const channel = (order.channel as OrderChannel) || OrderChannel.CARTORI;
  const kind = (order.kind as OrderKind) || OrderKind.OWN;

  await prisma.$transaction(async (tx) => {
    await tx.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        orderNumber: order.orderNumber,
        protocol: order.protocol,
        channel,
        kind,
        sellerOrgId: order.sellerOrgId,
        userId: order.userId || undefined,
        organizationId: order.organizationId || undefined,
        status,
        totalAmount: order.totalAmount,
        itemsTotal: order.itemsTotal,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerCpfCnpj: order.customerCpfCnpj,
        isCompany: order.isCompany,
        companyName: order.companyName,
        oabOrCreci: order.oabOrCreci,
        shippingCep: order.shippingCep,
        shippingStreet: order.shippingStreet,
        shippingNumber: order.shippingNumber,
        shippingComplement: order.shippingComplement,
        shippingDistrict: order.shippingDistrict,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
      },
      update: {
        status,
        userId: order.userId || undefined,
        organizationId: order.organizationId || undefined,
        totalAmount: order.totalAmount,
        itemsTotal: order.itemsTotal,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerCpfCnpj: order.customerCpfCnpj,
        isCompany: order.isCompany,
        companyName: order.companyName,
        oabOrCreci: order.oabOrCreci,
        shippingCep: order.shippingCep,
        shippingStreet: order.shippingStreet,
        shippingNumber: order.shippingNumber,
        shippingComplement: order.shippingComplement,
        shippingDistrict: order.shippingDistrict,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
      },
    });

    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    if (order.items.length) {
      const knownCartorioIds = await findExistingCartorioIds(
        order.items.map((item) => item.cartorioId)
      );
      await tx.orderItem.createMany({
        data: order.items.map((item) => ({
          id: item.id,
          orderId: order.id,
          category: item.category,
          certificateType: item.certificateType,
          certificateName: item.certificateName,
          state: item.state,
          city: item.city,
          cartorioId:
            item.cartorioId && knownCartorioIds.has(item.cartorioId)
              ? item.cartorioId
              : null,
          cartorioName: item.cartorioName,
          isUnknownCartorio: item.isUnknownCartorio,
          documentData: item.documentData,
          format: item.format as CertificateFormat,
          hasApostille: item.hasApostille,
          hasShipping: item.hasShipping,
          listPrice: item.listPrice,
          itemPrice: item.itemPrice,
          searchFee: item.searchFee,
          apostilleFee: item.apostilleFee,
          shippingPrice: item.shippingPrice,
          totalPrice: item.totalPrice,
          referenceTag: item.referenceTag,
          estimatedDays: item.estimatedDays,
        })),
      });
    }

    if (order.payment) {
      const existing = await tx.payment.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });

      const paymentData = {
        provider: "MERCADOPAGO",
        providerPaymentId: order.payment.providerPaymentId,
        paymentMethod: toPrismaPaymentMethod(order.payment.paymentMethod),
        status: toPrismaPaymentStatus(order.payment.status),
        amount: order.payment.amount,
        qrCode: order.payment.qrCode,
        qrCodeBase64: order.payment.qrCodeBase64,
        ticketUrl: order.payment.ticketUrl,
        metadata: { demo: Boolean(order.payment.demo) },
      };

      if (existing) {
        await tx.payment.update({
          where: { id: existing.id },
          data: paymentData,
        });
      } else {
        await tx.payment.create({
          data: {
            id: order.payment.id,
            orderId: order.id,
            ...paymentData,
          },
        });
      }
    }
  });

  const saved = await getOrderById(order.id);
  if (!saved) {
    throw new Error("Pedido não foi persistido.");
  }
  return saved;
}

export async function updateOrder(
  id: string,
  patch: (current: StoredOrder) => StoredOrder
): Promise<StoredOrder | null> {
  const current = await getOrderById(id);
  if (!current) return null;
  return saveOrder(patch(current));
}

export async function getOrderChargeAmount(orderId: string): Promise<Prisma.Decimal | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { totalAmount: true },
  });
  return order?.totalAmount ?? null;
}

export async function findOrderByPaymentId(
  providerPaymentId: string
): Promise<StoredOrder | null> {
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
    include: {
      order: { include: orderInclude },
    },
  });

  return payment?.order ? toStoredOrder(payment.order) : null;
}
