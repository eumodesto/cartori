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
import { createId } from "@/lib/utils";
import {
  OrderDraft,
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

function jsonObject(value: Prisma.JsonValue | null | undefined): Prisma.JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Prisma.JsonObject)
    : {};
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

export function protocolFromNumber(orderNumber: number): string {
  return `CTR-${String(orderNumber).padStart(6, "0")}`;
}

/** Chave do advisory lock que serializa a numeração entre instâncias. */
const ORDER_NUMBER_LOCK_KEY = 7_412_001;
const CREATE_ORDER_ATTEMPTS = 3;

async function orderItemRows(orderId: string, items: StoredOrderItem[]) {
  const knownCartorioIds = await findExistingCartorioIds(
    items.map((item) => item.cartorioId)
  );
  return items.map((item) => ({
    id: item.id,
    orderId,
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
  }));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

/**
 * Grava um pedido novo com itens, sem cobrança. Número = máximo + 1 sob
 * `pg_advisory_xact_lock`; P2002 só ocorre se algum escritor ignorar o lock
 * (ex.: instância com código antigo durante o deploy), e então tenta de novo.
 */
export async function createOrder(draft: OrderDraft): Promise<StoredOrder> {
  const items = await orderItemRows(draft.id, draft.items);

  for (let attempt = 1; ; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ORDER_NUMBER_LOCK_KEY})`;
          const aggregate = await tx.order.aggregate({ _max: { orderNumber: true } });
          const orderNumber = Math.max(1000, aggregate._max.orderNumber ?? 1000) + 1;

          await tx.order.create({
            data: {
              id: draft.id,
              orderNumber,
              protocol: protocolFromNumber(orderNumber),
              channel: (draft.channel as OrderChannel) || OrderChannel.CARTORI,
              kind: (draft.kind as OrderKind) || OrderKind.OWN,
              sellerOrgId: draft.sellerOrgId,
              userId: draft.userId || undefined,
              organizationId: draft.organizationId || undefined,
              status: draft.status as OrderStatus,
              totalAmount: draft.totalAmount,
              itemsTotal: draft.itemsTotal,
              shippingTotal: draft.shippingTotal,
              discountTotal: draft.discountTotal,
              customerName: draft.customerName,
              customerEmail: draft.customerEmail,
              customerPhone: draft.customerPhone,
              customerCpfCnpj: draft.customerCpfCnpj,
              isCompany: draft.isCompany,
              companyName: draft.companyName,
              oabOrCreci: draft.oabOrCreci,
              shippingCep: draft.shippingCep,
              shippingStreet: draft.shippingStreet,
              shippingNumber: draft.shippingNumber,
              shippingComplement: draft.shippingComplement,
              shippingDistrict: draft.shippingDistrict,
              shippingCity: draft.shippingCity,
              shippingState: draft.shippingState,
            },
          });
          if (items.length) {
            await tx.orderItem.createMany({ data: items });
          }
        },
        { maxWait: 10_000, timeout: 10_000 }
      );
      break;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= CREATE_ORDER_ATTEMPTS) throw error;
    }
  }

  const saved = await getOrderById(draft.id);
  if (!saved) {
    throw new Error("Pedido não foi persistido.");
  }
  return saved;
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

    // Itens são snapshot da venda e carregam estado operacional da mesa
    // (status, rastreio, arquivo emitido): nunca recriar, só inserir os ausentes.
    if (order.items.length) {
      await tx.orderItem.createMany({
        data: await orderItemRows(order.id, order.items),
        skipDuplicates: true,
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
      };
      const demo = Boolean(order.payment.demo);

      // Linha com cobrança no provedor é histórico financeiro: outra cobrança
      // (ou outro método) vira linha nova, para o webhook antigo continuar vinculado.
      const keepsExistingCharge =
        Boolean(existing?.providerPaymentId) &&
        (existing!.providerPaymentId !== paymentData.providerPaymentId ||
          existing!.paymentMethod !== paymentData.paymentMethod);

      if (existing && !keepsExistingCharge) {
        await tx.payment.update({
          where: { id: existing.id },
          data: { ...paymentData, metadata: { ...jsonObject(existing.metadata), demo } },
        });
      } else {
        await tx.payment.create({
          data: {
            ...paymentData,
            id: existing && order.payment.id === existing.id ? createId() : order.payment.id,
            orderId: order.id,
            providerPaymentId:
              paymentData.providerPaymentId === existing?.providerPaymentId
                ? null
                : paymentData.providerPaymentId,
            metadata: { demo },
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
