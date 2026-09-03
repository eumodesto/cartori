import { Prisma } from "@prisma/client";
import { MVP_CERTIFICATES, getCertificateBySlug } from "@/lib/catalog";
import {
  CRC_UF_APOSTILLE_PRICES,
  CRC_UF_FLAT_PRICES,
  CRC_UF_FORMAT_PRICES,
} from "@/lib/crc-uf-prices";
import { prisma } from "@/lib/prisma";
import {
  CertificateCategory,
  CertificatePriceMode,
  CertificateTypeConfig,
  FormFieldDefinition,
} from "@/lib/types";

const FIELD_TYPES = new Set<FormFieldDefinition["type"]>([
  "text",
  "number",
  "date",
  "select",
  "radio",
  "textarea",
  "checkbox",
]);

const PRICE_MODES = new Set<CertificatePriceMode>([
  "national",
  "uf-format",
  "uf-flat",
]);

type ProductRecord = Prisma.ProductGetPayload<{
  include: { fields: true; prices: true };
}>;

const productInclude = {
  fields: { orderBy: { sortOrder: "asc" as const } },
  prices: true,
} satisfies Prisma.ProductInclude;

function resolveSlug(slug: string) {
  return slug === "certidao-de-escritura"
    ? "certidao-de-escritura-de-compra-e-venda"
    : slug;
}

function asFieldType(value: string): FormFieldDefinition["type"] {
  return FIELD_TYPES.has(value as FormFieldDefinition["type"])
    ? (value as FormFieldDefinition["type"])
    : "text";
}

function asPriceMode(value: string | null | undefined): CertificatePriceMode | undefined {
  if (!value || value === "national") return undefined;
  return PRICE_MODES.has(value as CertificatePriceMode)
    ? (value as CertificatePriceMode)
    : undefined;
}

export function attachStaticPrices(
  cert: CertificateTypeConfig
): CertificateTypeConfig {
  return {
    ...cert,
    ufFormatPrices: cert.ufFormatPrices ?? CRC_UF_FORMAT_PRICES[cert.slug],
    ufFlatPrices: cert.ufFlatPrices ?? CRC_UF_FLAT_PRICES[cert.slug],
    ufApostillePrices:
      cert.ufApostillePrices ?? CRC_UF_APOSTILLE_PRICES[cert.slug],
  };
}

function toField(row: ProductRecord["fields"][number]): FormFieldDefinition {
  const options = Array.isArray(row.options)
    ? (row.options as unknown as FormFieldDefinition["options"])
    : undefined;
  const visibleWhen = row.visibleWhen
    ? (row.visibleWhen as unknown as FormFieldDefinition["visibleWhen"])
    : undefined;
  const priceByUf =
    row.priceByUf && typeof row.priceByUf === "object" && !Array.isArray(row.priceByUf)
      ? (row.priceByUf as Record<string, number>)
      : undefined;

  return {
    id: row.fieldKey,
    label: row.label,
    type: asFieldType(row.type),
    placeholder: row.placeholder || undefined,
    helperText: row.helperText || undefined,
    required: row.required,
    options,
    visibleWhen,
    dataSource:
      row.dataSource === "ibge-uf" || row.dataSource === "ibge-city"
        ? row.dataSource
        : undefined,
    price: row.price != null ? Number(row.price) : undefined,
    priceByUf,
  };
}

function toCertificateConfig(row: ProductRecord): CertificateTypeConfig {
  const ufFormatPrices: NonNullable<CertificateTypeConfig["ufFormatPrices"]> = {};
  const ufFlatPrices: Record<string, number> = {};
  const ufApostillePrices: Record<string, number> = {};

  for (const price of row.prices) {
    const amount = Number(price.amount);
    if (price.kind === "APOSTILLE") {
      ufApostillePrices[price.state] = amount;
      continue;
    }
    if (price.format === "FLAT") {
      ufFlatPrices[price.state] = amount;
      continue;
    }
    const current = ufFormatPrices[price.state] ?? {
      ELECTRONIC: null,
      PAPER: null,
      BOTH: null,
    };
    if (
      price.format === "ELECTRONIC" ||
      price.format === "PAPER" ||
      price.format === "BOTH"
    ) {
      current[price.format] = amount;
    }
    ufFormatPrices[price.state] = current;
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    category: row.category as CertificateCategory,
    categoryName: row.categoryName,
    basePrice: Number(row.basePrice),
    estimatedDays: row.estimatedDays,
    requiresCartorio: row.requiresCartorio,
    hasSearchFee: row.hasSearchFee,
    searchFee: Number(row.searchFee),
    hasApostilleOption: row.hasApostilleOption,
    apostillePrice: Number(row.apostillePrice),
    hasShippingOption: row.hasShippingOption,
    shippingPrice: Number(row.shippingPrice),
    priceMode: asPriceMode(row.priceMode),
    fields: row.fields.map(toField),
    ufFormatPrices: Object.keys(ufFormatPrices).length ? ufFormatPrices : undefined,
    ufFlatPrices: Object.keys(ufFlatPrices).length ? ufFlatPrices : undefined,
    ufApostillePrices: Object.keys(ufApostillePrices).length
      ? ufApostillePrices
      : undefined,
  };
}

export async function listProducts(): Promise<CertificateTypeConfig[]> {
  const { products } = await listProductsWithSource();
  return products;
}

export async function listProductsWithSource(): Promise<{
  source: "database" | "fallback";
  products: CertificateTypeConfig[];
}> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: productInclude,
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length >= MVP_CERTIFICATES.length) {
      return { source: "database", products: rows.map(toCertificateConfig) };
    }
  } catch (error) {
    console.error("Falha ao ler Product no banco:", error);
  }
  return {
    source: "fallback",
    products: MVP_CERTIFICATES.map(attachStaticPrices),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<CertificateTypeConfig | undefined> {
  const resolved = resolveSlug(slug);
  try {
    const row = await prisma.product.findUnique({
      where: { slug: resolved },
      include: productInclude,
    });
    if (row?.active) return toCertificateConfig(row);
  } catch (error) {
    console.error("Falha ao ler Product por slug:", error);
  }
  const fallback = getCertificateBySlug(slug) || getCertificateBySlug(resolved);
  return fallback ? attachStaticPrices(fallback) : undefined;
}
