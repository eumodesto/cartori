import { CertificateFormat, CertificateTypeConfig, CartItem } from "@/lib/types";
import {
  CRC_UF_FLAT_PRICES,
  CRC_UF_FORMAT_PRICES,
  crcFormatKey,
  lookupUfApostillePrice,
  lookupUfFlatPrice,
  lookupUfFormatPrice,
} from "@/lib/crc-uf-prices";
import { extrasFromDocument } from "@/lib/field-visibility";
import {
  certificateNameWithInteiroTeor,
  inteiroTeorIssuanceValues,
} from "@/lib/inteiro-teor";
import { createId } from "@/lib/utils";

export interface ItemPricing {
  basePrice: number;
  searchFee: number;
  apostillePrice: number;
  extrasPrice: number;
  shippingPrice: number;
  itemsSubtotal: number;
  itemTotal: number;
}

export interface PricingInput {
  format: CertificateFormat;
  isUnknownCartorio: boolean;
  hasApostille: boolean;
  uf?: string;
  documentData?: Record<string, string>;
}

export function listPriceFor(
  cert: CertificateTypeConfig,
  format: CertificateFormat,
  uf?: string
): number {
  const mode = cert.priceMode || "national";
  const sigla = (uf || "").toUpperCase();

  if (mode === "uf-format" && sigla) {
    const row = cert.ufFormatPrices?.[sigla];
    if (row) {
      const key = crcFormatKey(format);
      const found = row[key] ?? row.ELECTRONIC ?? row.PAPER ?? row.BOTH;
      if (found != null) return roundMoney(found);
    }
    const found = lookupUfFormatPrice(cert.slug, sigla, format);
    if (found != null) return roundMoney(found);
  }

  if (mode === "uf-flat" && sigla) {
    const attached = cert.ufFlatPrices?.[sigla];
    if (attached != null) return roundMoney(attached);
    const found = lookupUfFlatPrice(cert.slug, sigla);
    if (found != null) return roundMoney(found);
  }

  return cert.basePrice;
}

export function startingPriceFor(cert: CertificateTypeConfig): number {
  if (cert.priceMode === "uf-format") {
    const table = cert.ufFormatPrices || CRC_UF_FORMAT_PRICES[cert.slug];
    const amounts = Object.values(table || {})
      .map((row) => row.ELECTRONIC)
      .filter((value): value is number => value != null && value > 0);
    if (amounts.length) return roundMoney(Math.min(...amounts));
  }
  if (cert.priceMode === "uf-flat") {
    const table = cert.ufFlatPrices || CRC_UF_FLAT_PRICES[cert.slug];
    const amounts = Object.values(table || {}).filter((value) => value > 0);
    if (amounts.length) return roundMoney(Math.min(...amounts));
  }
  return cert.basePrice;
}

export function apostillePriceFor(cert: CertificateTypeConfig, uf?: string): number {
  if (!cert.hasApostilleOption) return 0;
  const sigla = (uf || "").toUpperCase();
  if (sigla && cert.ufApostillePrices?.[sigla] != null) {
    return cert.ufApostillePrices[sigla];
  }
  return lookupUfApostillePrice(cert.slug, uf) ?? cert.apostillePrice;
}

export function priceCertificate(
  cert: CertificateTypeConfig,
  input: PricingInput
): ItemPricing {
  const basePrice = listPriceFor(cert, input.format, input.uf);
  const searchFee =
    input.isUnknownCartorio && cert.hasSearchFee ? cert.searchFee : 0;
  const apostillePrice =
    input.hasApostille && cert.hasApostilleOption
      ? apostillePriceFor(cert, input.uf)
      : 0;
  const extrasPrice = roundMoney(
    extrasFromDocument(cert.fields, input.documentData || {}, {
      format: input.format,
      uf: input.uf,
    })
  );
  const needsShipping = input.format !== "DIGITAL_ECERTIDAO";
  const shippingPrice =
    needsShipping && cert.hasShippingOption ? cert.shippingPrice : 0;
  const itemsSubtotal = basePrice + searchFee + apostillePrice + extrasPrice;

  return {
    basePrice,
    searchFee,
    apostillePrice,
    extrasPrice,
    shippingPrice,
    itemsSubtotal,
    itemTotal: itemsSubtotal + shippingPrice,
  };
}

export function cartTotals(items: CartItem[]) {
  const itemsSubtotal = items.reduce(
    (sum, item) =>
      sum +
      item.basePrice +
      item.searchFee +
      item.apostillePrice +
      (item.extrasPrice || 0),
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

export function expandInteiroTeorCartItems(
  cert: CertificateTypeConfig,
  item: CartItem
): CartItem[] {
  const selected = String(item.documentData?.inteiro_teor || "");
  const values = inteiroTeorIssuanceValues(selected);
  const issuances = values.length > 0 ? values : [selected];

  return issuances.map((value, index) => {
    const documentData = value
      ? { ...item.documentData, inteiro_teor: value }
      : { ...item.documentData };
    const priced = priceCertificate(cert, {
      format: item.format,
      isUnknownCartorio: item.isUnknownCartorio,
      hasApostille: item.hasApostille,
      uf: item.state,
      documentData,
    });
    const searchFee = index === 0 ? priced.searchFee : 0;
    const shippingPrice = index === 0 ? priced.shippingPrice : 0;
    const extraCtx = { format: item.format, uf: item.state };
    const teorExtras = extrasFromDocument(cert.fields, documentData, {
      ...extraCtx,
      inteiroTeor: true,
      shared: false,
    });
    const sharedExtras =
      index === 0
        ? extrasFromDocument(cert.fields, documentData, {
            ...extraCtx,
            inteiroTeor: false,
            shared: true,
          })
        : 0;
    const extrasPrice = roundMoney(teorExtras + sharedExtras);
    const itemsSubtotal =
      priced.basePrice + searchFee + priced.apostillePrice + extrasPrice;
    return {
      ...item,
      id: index === 0 ? item.id || createId() : createId(),
      certificateName: certificateNameWithInteiroTeor(cert.name, value),
      documentData,
      hasApostille: priced.apostillePrice > 0,
      hasShipping: shippingPrice > 0,
      basePrice: roundMoney(priced.basePrice),
      searchFee: roundMoney(searchFee),
      apostillePrice: roundMoney(priced.apostillePrice),
      extrasPrice,
      shippingPrice: roundMoney(shippingPrice),
      itemTotal: roundMoney(itemsSubtotal + shippingPrice),
    };
  });
}
