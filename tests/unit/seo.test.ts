import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import { certificatePath, listCertificatePathParams, resolveCertificateSlug } from "@/lib/certificate-links";
import {
  DESCRIPTION_MAX,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_URL,
  TITLE_MAX,
  certificateSeoDescription,
  certificateSeoTitle,
  certificateServiceJsonLd,
  certificateShortName,
  serializeJsonLd,
} from "@/lib/seo";

describe("títulos e descrições", () => {
  it("home dentro dos limites", () => {
    expect(HOME_TITLE.length).toBeGreaterThanOrEqual(50);
    expect(HOME_TITLE.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(HOME_DESCRIPTION.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it.each(MVP_CERTIFICATES.map((cert) => [cert.slug, cert] as const))(
    "%s: título começa pelo nome e cabe em 60; descrição cabe em 155",
    (_slug, cert) => {
      const title = certificateSeoTitle(cert);
      expect(title.startsWith(certificateShortName(cert))).toBe(true);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
      const description = certificateSeoDescription(cert);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(description).toMatch(/Peça online\.$/);
    }
  );

  it("descrição longa é cortada em palavra inteira, com CTA", () => {
    const description = certificateSeoDescription({
      shortDescription: "palavra ".repeat(40).trim(),
      estimatedDays: "3 a 5 dias úteis",
    });
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(description).toMatch(/palavra… Peça online\.$/);
  });
});

describe("canônico e sitemap", () => {
  it("todo apelido de /certidao resolve para um slug oficial do catálogo", () => {
    for (const { slug } of listCertificatePathParams()) {
      const canonical = resolveCertificateSlug(slug);
      expect(MVP_CERTIFICATES.some((cert) => cert.slug === canonical)).toBe(true);
    }
  });

  it("sitemap só lista URLs oficiais, sem duplicatas, no domínio canônico", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith(SITE_URL))).toBe(true);
    for (const cert of MVP_CERTIFICATES) {
      expect(urls).toContain(`${SITE_URL}${certificatePath(cert.slug)}`);
    }
    expect(urls.some((url) => /\/(painel|admin|operacao|checkout|carrinho|pedido)/.test(url))).toBe(false);
  });
});

describe("JSON-LD", () => {
  it("serviço declara preço 'a partir de' em BRL", () => {
    const data = certificateServiceJsonLd(MVP_CERTIFICATES[0]) as {
      offers: { priceCurrency: string; lowPrice: string };
    };
    expect(data.offers.priceCurrency).toBe("BRL");
    expect(Number(data.offers.lowPrice)).toBeGreaterThan(0);
  });

  it("não deixa o conteúdo fechar a tag script", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
