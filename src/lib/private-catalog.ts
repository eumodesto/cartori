import { PRIVATE_FORM_FIELDS } from "./private-form-fields";
import { PRIVATE_UF_APOSTILLE_PRICES, PRIVATE_UF_FORMAT_PRICES } from "./private-prices";
import { CertificateTypeConfig } from "./types";

/**
 * Catálogo privado: certidões vendidas só para usuários logados (área do cliente).
 *
 * Registro Civil está na lista restrita da política de documentos do governo do Google Ads,
 * por isso não aparece em nenhuma página pública, sitemap, rodapé, Amanda ou anúncio.
 * Importe este módulo SOMENTE em código de servidor (página server do painel, product-store,
 * pedidos): importado por um componente "use client", estes dados iriam para o JS público.
 */
const BASE_CERTIFICATES: CertificateTypeConfig[] = [
  {
    id: "nascimento",
    slug: "certidao-de-nascimento",
    name: "Certidão de Nascimento",
    shortDescription: "2ª via de nascimento com validade jurídica nacional em formato digital ou papel moeda.",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 299.90,
    estimatedDays: "3 a 5 dias úteis",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 35.00,
    hasApostilleOption: true,
    apostillePrice: 259.90,
    hasShippingOption: true,
    shippingPrice: 32.00,
    priceMode: "uf-format",
    fields: PRIVATE_FORM_FIELDS["certidao-de-nascimento"],
  },
  {
    id: "casamento",
    slug: "certidao-de-casamento",
    name: "Certidão de Casamento",
    shortDescription: "2ª via da certidão de casamento com averbações (divórcio, alteração de nome, etc.).",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 299.90,
    estimatedDays: "3 a 5 dias úteis",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 35.00,
    hasApostilleOption: true,
    apostillePrice: 259.90,
    hasShippingOption: true,
    shippingPrice: 32.00,
    priceMode: "uf-format",
    fields: PRIVATE_FORM_FIELDS["certidao-de-casamento"],
  },
  {
    id: "obito",
    slug: "certidao-de-obito",
    name: "Certidão de Óbito",
    shortDescription: "2ª via de certidão de óbito indispensável para inventários, heranças, partilhas e encerramentos.",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 299.90,
    estimatedDays: "3 a 5 dias úteis",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 35.00,
    hasApostilleOption: true,
    apostillePrice: 259.90,
    hasShippingOption: true,
    shippingPrice: 32.00,
    priceMode: "uf-format",
    fields: PRIVATE_FORM_FIELDS["certidao-de-obito"],
  },
  {
    id: "divorcio",
    slug: "certidao-de-divorcio",
    name: "Certidão de Divórcio",
    shortDescription: "2ª via da certidão de casamento com averbação de divórcio, ou certidão específica de divórcio lavrada no registro civil.",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 299.90,
    estimatedDays: "3 a 5 dias úteis",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 35.00,
    hasApostilleOption: true,
    apostillePrice: 259.90,
    hasShippingOption: true,
    shippingPrice: 32.00,
    priceMode: "uf-format",
    fields: PRIVATE_FORM_FIELDS["certidao-de-divorcio"],
  },
  {
    id: "interdicao",
    slug: "certidao-de-interdicao",
    name: "Certidão de Interdição",
    shortDescription: "Comprova se a capacidade civil de uma pessoa foi limitada por decisão judicial e indica o curador nomeado.",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 329.90,
    estimatedDays: "3 a 6 dias úteis",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 35.00,
    hasApostilleOption: true,
    apostillePrice: 259.90,
    hasShippingOption: true,
    shippingPrice: 32.00,
    fields: PRIVATE_FORM_FIELDS["certidao-de-interdicao"],
  },
];

/** Preços por UF já anexados: o navegador não precisa (nem recebe) as tabelas privadas. */
export const PRIVATE_CERTIFICATES: CertificateTypeConfig[] = BASE_CERTIFICATES.map((cert) => ({
  ...cert,
  ufFormatPrices: cert.ufFormatPrices ?? PRIVATE_UF_FORMAT_PRICES[cert.slug],
  ufApostillePrices: cert.ufApostillePrices ?? PRIVATE_UF_APOSTILLE_PRICES[cert.slug],
}));

export function getPrivateCertificateBySlug(slug: string): CertificateTypeConfig | undefined {
  return PRIVATE_CERTIFICATES.find((item) => item.slug === slug || item.id === slug);
}
