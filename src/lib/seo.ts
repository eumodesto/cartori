import { startingPriceFor } from "@/lib/pricing";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  SUPPORT_COMPANY,
  SUPPORT_EMAIL,
} from "@/lib/support-contacts";
import type { CertificateTypeConfig } from "@/lib/types";

/** Domínio canônico. Fixo para que previews e *.vercel.app nunca virem canônico. */
export const SITE_URL = "https://www.cartori.com.br";
export const SITE_NAME = "Cartori";

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

export const HOME_TITLE = "Certidões online em todo o Brasil em um só pedido | Cartori";
export const HOME_DESCRIPTION =
  "Peça certidões de nascimento, casamento, imóveis, protesto e notas em todo o Brasil. Um só pedido, PIX ou cartão e acompanhamento online. Solicite agora.";

/** Next substitui (não mescla) openGraph por página: quem define openGraph repete a imagem. */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Cartori: certidões online em todo o Brasil",
};

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Nome sem complementos entre parênteses, para caber no título. */
export function certificateShortName(cert: Pick<CertificateTypeConfig, "name">) {
  return cert.name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

/** Maior variação que caiba em TITLE_MAX, com o nome da certidão no início. */
export function certificateSeoTitle(cert: Pick<CertificateTypeConfig, "name">) {
  const name = certificateShortName(cert);
  const candidates = [
    `${name}: peça online e acompanhe | ${SITE_NAME}`,
    `${name}: peça online | ${SITE_NAME}`,
    `${name} online | ${SITE_NAME}`,
    `${name} | ${SITE_NAME}`,
    name,
  ];
  return candidates.find((title) => title.length <= TITLE_MAX) ?? candidates[candidates.length - 1];
}

function clipAtWord(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Resumo + prazo + chamada, sempre até DESCRIPTION_MAX. */
export function certificateSeoDescription(
  cert: Pick<CertificateTypeConfig, "shortDescription" | "estimatedDays">
) {
  const cta = cert.estimatedDays
    ? ` Prazo estimado: ${cert.estimatedDays}. Peça online.`
    : " Peça online.";
  const summary = cert.shortDescription.trim().replace(/\.$/, "") + ".";
  if (summary.length + cta.length <= DESCRIPTION_MAX) return summary + cta;
  const shortCta = " Peça online.";
  if (summary.length + shortCta.length <= DESCRIPTION_MAX) return summary + shortCta;
  return clipAtWord(summary, DESCRIPTION_MAX - shortCta.length) + shortCta;
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SUPPORT_COMPANY.legalName,
    taxID: SUPPORT_COMPANY.cnpj,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    email: SUPPORT_EMAIL,
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      availableLanguage: "pt-BR",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Preço "a partir de": varia por estado e formato, então não declara valor fixo. */
export function certificateServiceJsonLd(cert: CertificateTypeConfig): JsonLd {
  const url = absoluteUrl(`/certidao/${cert.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: cert.name,
    description: cert.shortDescription,
    serviceType: cert.categoryName,
    url,
    areaServed: { "@type": "Country", name: "Brasil" },
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: startingPriceFor(cert).toFixed(2),
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** JSON seguro para <script type="application/ld+json"> (evita fechar a tag). */
export function serializeJsonLd(data: JsonLd | JsonLd[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
