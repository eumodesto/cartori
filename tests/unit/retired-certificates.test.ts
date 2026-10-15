import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  MVP_CERTIFICATES,
  RETIRED_CERTIFICATE_SLUGS,
  getCertificateBySlug,
  isPrivateCertificate,
  isRetiredCertificate,
} from "@/lib/catalog";
import { resolveCertificateSlug } from "@/lib/certificate-links";
import { PRIVATE_CERTIFICATES } from "@/lib/private-catalog";
import { getProductBySlug } from "@/lib/product-store";

const REGISTRO_CIVIL = [
  "certidao-de-nascimento",
  "certidao-de-casamento",
  "certidao-de-obito",
  "certidao-de-divorcio",
  "certidao-de-interdicao",
];

describe("catálogo público × privado × retirado", () => {
  it("catálogo público não tem Registro Civil nem retiradas", () => {
    for (const cert of MVP_CERTIFICATES) {
      expect(isRetiredCertificate(cert), cert.slug).toBe(false);
      expect(isPrivateCertificate(cert), cert.slug).toBe(false);
    }
    for (const slug of [...REGISTRO_CIVIL, ...RETIRED_CERTIFICATE_SLUGS]) {
      expect(getCertificateBySlug(slug), slug).toBeUndefined();
    }
  });

  it("Registro Civil fica só no catálogo privado", () => {
    expect(PRIVATE_CERTIFICATES.map((cert) => cert.slug).sort()).toEqual([...REGISTRO_CIVIL].sort());
    for (const cert of PRIVATE_CERTIFICATES) expect(isPrivateCertificate(cert)).toBe(true);
  });

  it("checkout (logado) encontra as privadas e recusa as retiradas", async () => {
    expect((await getProductBySlug("certidao-de-nascimento"))?.slug).toBe("certidao-de-nascimento");
    expect(await getProductBySlug("trt-certidao-de-acoes-trabalhistas-ceat")).toBeUndefined();
    expect(await getProductBySlug("pesquisa-de-protesto")).toBeUndefined();
  });

  it("atalhos e sitemap públicos não apontam para privadas nem retiradas", () => {
    for (const alias of ["nascimento", "casamento", "obito", "divorcio", "interdicao"]) {
      expect(resolveCertificateSlug(alias), alias).toBeNull();
    }
    const urls = sitemap().map((entry) => entry.url);
    for (const slug of [...REGISTRO_CIVIL, ...RETIRED_CERTIFICATE_SLUGS]) {
      expect(urls.some((url) => url.includes(slug)), slug).toBe(false);
    }
  });

  it("nenhum componente de navegador importa o catálogo privado", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(name)) {
          const source = readFileSync(full, "utf8");
          if (/^\s*["']use client["']/.test(source) && /private-(catalog|prices|form-fields)/.test(source)) {
            offenders.push(full);
          }
        }
      }
    };
    walk(path.resolve(__dirname, "../../src"));
    expect(offenders).toEqual([]);
  });
});
