import { CertificateFormat, CertificateTypeConfig, CartItem } from "@/lib/types";

export interface ItemPricing {
  basePrice: number;
  searchFee: number;
  apostillePrice: number;
  shippingPrice: number;
  itemsSubtotal: number;
  itemTotal: number;
}

export interface PricingInput {
  format: CertificateFormat;
  isUnknownCartorio: boolean;
  hasApostille: boolean;
}

export function priceCertificate(
  cert: CertificateTypeConfig,
  input: PricingInput
): ItemPricing {
  const searchFee =
    input.isUnknownCartorio && cert.hasSearchFee ? cert.searchFee : 0;
  const apostillePrice =
    input.hasApostille && cert.hasApostilleOption ? cert.apostillePrice : 0;
  const needsShipping = input.format !== "DIGITAL_ECERTIDAO";
  const shippingPrice =
    needsShipping && cert.hasShippingOption ? cert.shippingPrice : 0;
  const itemsSubtotal = cert.basePrice + searchFee + apostillePrice;

  return {
    basePrice: cert.basePrice,
    searchFee,
    apostillePrice,
    shippingPrice,
    itemsSubtotal,
    itemTotal: itemsSubtotal + shippingPrice,
  };
}

export function cartTotals(items: CartItem[]) {
  const itemsSubtotal = items.reduce(
    (sum, item) =>
      sum + item.basePrice + item.searchFee + item.apostillePrice,
    0
  );
  const shippingSubtotal = items.reduce((sum, item) => sum + item.shippingPrice, 0);

  return {
    itemsSubtotal,
    shippingSubtotal,
    total: itemsSubtotal + shippingSubtotal,
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
