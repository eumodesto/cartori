import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { MVP_CERTIFICATES, getCertificateBySlug } from "@/lib/catalog";
import { resolveCertificateSlug } from "@/lib/certificate-links";
import { PRIVATE_CERTIFICATES, isPrivateCertificateSlug } from "@/lib/private-catalog";
import { getProductBySlug } from "@/lib/product-store";

/** Fora do site público: Registro Civil e as gratuitas/diretas nos órgãos oficiais. */
const PRIVATE_SLUGS = [
  "certidao-de-nascimento",
  "certidao-de-casamento",
  "certidao-de-obito",
  "certidao-de-divorcio",
  "certidao-de-interdicao",
  "trf-certidao-de-distribuicao-da-justica-federal",
  "trt-certidao-de-acoes-trabalhistas-ceat",
  "pesquisa-de-protesto",
  "ccir-certificado-cadastro-imovel-rural-incra",
];

describe("catálogo público × área logada", () => {
  it("as certidões privadas estão só no catálogo privado", () => {
    expect(PRIVATE_CERTIFICATES.map((cert) => cert.slug).sort()).toEqual([...PRIVATE_SLUGS].sort());
    for (const slug of PRIVATE_SLUGS) {
      expect(getCertificateBySlug(slug), slug).toBeUndefined();
      expect(isPrivateCertificateSlug(slug), slug).toBe(true);
    }
    for (const cert of MVP_CERTIFICATES) {
      expect(isPrivateCertificateSlug(cert.slug), cert.slug).toBe(false);
      expect(["registro-civil", "distribuidores-judiciais", "rural"]).not.toContain(cert.category);
    }
  });

  it("toda certidão privada tem campos de formulário", () => {
    for (const cert of PRIVATE_CERTIFICATES) {
      expect(Array.isArray(cert.fields), cert.slug).toBe(true);
    }
  });

  it("checkout (sempre logado) encontra as certidões privadas", async () => {
    for (const slug of ["certidao-de-nascimento", "trt-certidao-de-acoes-trabalhistas-ceat"]) {
      expect((await getProductBySlug(slug))?.slug, slug).toBe(slug);
    }
  });

  it("atalhos e sitemap públicos não apontam para as privadas", () => {
    for (const alias of ["nascimento", "casamento", "obito", "divorcio", "interdicao"]) {
      expect(resolveCertificateSlug(alias), alias).toBeNull();
    }
    const urls = sitemap().map((entry) => entry.url);
    for (const slug of PRIVATE_SLUGS) {
      expect(urls.some((url) => url.includes(slug)), slug).toBe(false);
    }
  });

  it("nenhum componente de navegador importa os módulos privados", () => {
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
