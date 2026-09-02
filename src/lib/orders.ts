import { getCertificateBySlug } from "@/lib/catalog";
import { isFieldVisible } from "@/lib/field-visibility";
import { certificateNameWithInteiroTeor } from "@/lib/inteiro-teor";
import { expandInteiroTeorCartItems, priceCertificate, roundMoney } from "@/lib/pricing";
import {
  CreateOrderPayload,
  StoredOrder,
  StoredOrderItem,
} from "@/lib/order-types";
import { CartItem, CertificateFormat } from "@/lib/types";
import { createId, digitsOnly } from "@/lib/utils";
import { nextOrderNumber } from "@/lib/order-store";

const FORMATS: CertificateFormat[] = [
  "DIGITAL_ECERTIDAO",
  "PHYSICAL_PAPER",
  "BOTH",
];

export function protocolFromNumber(orderNumber: number): string {
  return `CTR-${String(orderNumber).padStart(6, "0")}`;
}

export function buildOrderItemFromCart(item: CartItem): StoredOrderItem {
  const cert = getCertificateBySlug(item.certificateTypeSlug);
  if (!cert) {
    throw new Error(`Certidão não encontrada: ${item.certificateTypeSlug}`);
  }

  const format = FORMATS.includes(item.format) ? item.format : "DIGITAL_ECERTIDAO";
  const isUnknownCartorio = Boolean(item.isUnknownCartorio);
  const documentData = Object.fromEntries(
    Object.entries(item.documentData || {}).map(([key, value]) => [
      key,
      String(value ?? ""),
    ])
  );
  const pricing = priceCertificate(cert, {
    format,
    isUnknownCartorio,
    hasApostille: Boolean(item.hasApostille),
    uf: item.state,
    documentData,
  });

  if (cert.requiresCartorio) {
    if (!item.state || !item.city) {
      throw new Error(`Informe estado e cidade para ${cert.name}.`);
    }
    if (!isUnknownCartorio && !item.cartorioName) {
      throw new Error(`Selecione o cartório para ${cert.name}.`);
    }
  }

  for (const field of cert.fields) {
    if (!field.required) continue;
    if (
      !isFieldVisible(field, {
        documentData,
        format,
        uf: item.state,
      })
    ) {
      continue;
    }
    const value = String(documentData[field.id] ?? "").trim();
    if (field.type === "checkbox") {
      if (value !== "true") {
        throw new Error(`Marque "${field.label}" em ${cert.name}.`);
      }
      continue;
    }
    if (!value) {
      throw new Error(`Preencha "${field.label}" em ${cert.name}.`);
    }
  }

  return {
    id: item.id || createId(),
    category: cert.category,
    certificateType: cert.slug,
    certificateName: certificateNameWithInteiroTeor(cert.name, documentData.inteiro_teor),
    state: cert.requiresCartorio ? item.state : "BR",
    city: cert.requiresCartorio ? item.city : "Brasil",
    cartorioId: item.cartorioId,
    cartorioName: cert.requiresCartorio
      ? isUnknownCartorio
        ? "Busca especializada de serventia"
        : item.cartorioName
      : cert.categoryName,
    isUnknownCartorio,
    documentData,
    format,
    hasApostille: pricing.apostillePrice > 0,
    hasShipping: pricing.shippingPrice > 0,
    listPrice: roundMoney(pricing.basePrice),
    itemPrice: roundMoney(pricing.basePrice + pricing.extrasPrice),
    searchFee: roundMoney(pricing.searchFee),
    apostilleFee: roundMoney(pricing.apostillePrice),
    shippingPrice: roundMoney(pricing.shippingPrice),
    totalPrice: roundMoney(pricing.itemTotal),
    referenceTag: item.referenceTag,
    estimatedDays: cert.estimatedDays,
  };
}

export async function buildStoredOrder(
  payload: CreateOrderPayload,
  owner?: { userId?: string | null; organizationId?: string | null }
): Promise<StoredOrder> {
  if (!payload.items?.length) {
    throw new Error("O pedido precisa de ao menos uma certidão.");
  }

  const items = payload.items.flatMap((item) => {
    const cert = getCertificateBySlug(item.certificateTypeSlug);
    if (!cert) {
      throw new Error(`Certidão não encontrada: ${item.certificateTypeSlug}`);
    }
    return expandInteiroTeorCartItems(cert, item).map(buildOrderItemFromCart);
  });
  const itemsTotal = roundMoney(
    items.reduce((sum, item) => sum + item.totalPrice - item.shippingPrice, 0)
  );
  const shippingTotal = roundMoney(
    items.reduce((sum, item) => sum + item.shippingPrice, 0)
  );
  const totalAmount = roundMoney(itemsTotal + shippingTotal);
  const orderNumber = await nextOrderNumber();
  const now = new Date().toISOString();
  const customer = payload.customer;
  const needsShipping = shippingTotal > 0;

  if (needsShipping) {
    const shipping = customer.shipping;
    if (
      !shipping?.cep ||
      !shipping.street ||
      !shipping.number ||
      !shipping.district ||
      !shipping.city ||
      !shipping.state
    ) {
      throw new Error("Informe o endereço completo para envio das certidões físicas.");
    }
  }

  return {
    id: createId(),
    orderNumber,
    protocol: protocolFromNumber(orderNumber),
    channel: "CARTORI",
    kind: "OWN",
    sellerOrgId: null,
    userId: owner?.userId || null,
    organizationId: owner?.organizationId || null,
    status: "PENDING_PAYMENT",
    totalAmount,
    itemsTotal,
    shippingTotal,
    discountTotal: 0,
    customerName: customer.fullName.trim(),
    customerEmail: customer.email.trim().toLowerCase(),
    customerPhone: digitsOnly(customer.phone),
    customerCpfCnpj: digitsOnly(customer.cpfCnpj),
    isCompany: Boolean(customer.isCompany),
    companyName: customer.companyName?.trim() || undefined,
    oabOrCreci: customer.oabOrCreci?.trim() || undefined,
    shippingCep: customer.shipping?.cep
      ? digitsOnly(customer.shipping.cep)
      : undefined,
    shippingStreet: customer.shipping?.street,
    shippingNumber: customer.shipping?.number,
    shippingComplement: customer.shipping?.complement,
    shippingDistrict: customer.shipping?.district,
    shippingCity: customer.shipping?.city,
    shippingState: customer.shipping?.state,
    items,
    payment: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function publicOrder(order: StoredOrder) {
  return {
    id: order.id,
    protocol: order.protocol,
    orderNumber: order.orderNumber,
    channel: order.channel,
    status: order.status,
    totalAmount: order.totalAmount,
    itemsTotal: order.itemsTotal,
    shippingTotal: order.shippingTotal,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items.map((item) => ({
      id: item.id,
      certificateName: item.certificateName,
      category: item.category,
      state: item.state,
      city: item.city,
      cartorioName: item.cartorioName,
      format: item.format,
      totalPrice: item.totalPrice,
      estimatedDays: item.estimatedDays,
      referenceTag: item.referenceTag,
    })),
    payment: order.payment
      ? {
          status: order.payment.status,
          amount: order.payment.amount,
          qrCode: order.payment.qrCode,
          qrCodeBase64: order.payment.qrCodeBase64,
          ticketUrl: order.payment.ticketUrl,
          demo: Boolean(order.payment.demo),
          method: order.payment.paymentMethod,
        }
      : null,
    createdAt: order.createdAt,
  };
}
