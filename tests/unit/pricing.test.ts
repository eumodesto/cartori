import { describe, expect, it } from "vitest";
import {
  apostillePriceFor,
  listPriceFor,
  priceCertificate,
  roundMoney,
  startingPriceFor,
} from "@/lib/pricing";
import type { CertificateTypeConfig } from "@/lib/types";

function cert(overrides: Partial<CertificateTypeConfig> = {}): CertificateTypeConfig {
  return {
    id: "teste",
    slug: "teste-sem-tabela-estatica",
    name: "Certidão de teste",
    shortDescription: "",
    category: "registro-civil",
    categoryName: "Registro Civil",
    basePrice: 100,
    estimatedDays: "5 dias",
    requiresCartorio: true,
    hasSearchFee: true,
    searchFee: 30,
    hasApostilleOption: true,
    apostillePrice: 80,
    hasShippingOption: true,
    shippingPrice: 25,
    priceMode: "national",
    fields: [],
    ...overrides,
  };
}

describe("listPriceFor", () => {
  it("modo nacional usa basePrice", () => {
    expect(listPriceFor(cert(), "DIGITAL_ECERTIDAO", "SP")).toBe(100);
  });

  it("modo uf-format usa a coluna do formato", () => {
    const c = cert({
      priceMode: "uf-format",
      ufFormatPrices: { SP: { ELECTRONIC: 120, PAPER: 150, BOTH: 200 } },
    });
    expect(listPriceFor(c, "DIGITAL_ECERTIDAO", "SP")).toBe(120);
    expect(listPriceFor(c, "PHYSICAL_PAPER", "sp")).toBe(150);
    expect(listPriceFor(c, "BOTH", "SP")).toBe(200);
  });

  it("modo uf-format sem a coluna do formato cai para a eletrônica", () => {
    const c = cert({
      priceMode: "uf-format",
      ufFormatPrices: { SP: { ELECTRONIC: 120, PAPER: null, BOTH: null } },
    });
    expect(listPriceFor(c, "PHYSICAL_PAPER", "SP")).toBe(120);
  });

  it("UF sem tabela volta para basePrice", () => {
    const c = cert({
      priceMode: "uf-format",
      ufFormatPrices: { SP: { ELECTRONIC: 120, PAPER: 150, BOTH: 200 } },
    });
    expect(listPriceFor(c, "DIGITAL_ECERTIDAO", "RJ")).toBe(100);
    expect(listPriceFor(c, "DIGITAL_ECERTIDAO")).toBe(100);
  });

  it("modo uf-flat usa o preço da UF", () => {
    const c = cert({ priceMode: "uf-flat", ufFlatPrices: { MG: 90 } });
    expect(listPriceFor(c, "BOTH", "MG")).toBe(90);
    expect(listPriceFor(c, "BOTH", "SP")).toBe(100);
  });
});

describe("startingPriceFor", () => {
  it("usa o menor preço eletrônico da tabela", () => {
    const c = cert({
      priceMode: "uf-format",
      ufFormatPrices: {
        SP: { ELECTRONIC: 120, PAPER: 150, BOTH: 200 },
        MG: { ELECTRONIC: 95, PAPER: 130, BOTH: 180 },
      },
    });
    expect(startingPriceFor(c)).toBe(95);
  });
});

describe("apostillePriceFor", () => {
  it("prefere o valor da UF e nega quando o produto não tem apostila", () => {
    expect(apostillePriceFor(cert({ ufApostillePrices: { SP: 95 } }), "SP")).toBe(95);
    expect(apostillePriceFor(cert(), "SP")).toBe(80);
    expect(apostillePriceFor(cert({ hasApostilleOption: false }), "SP")).toBe(0);
  });
});

describe("priceCertificate", () => {
  it("digital com cartório conhecido: só o preço base", () => {
    const priced = priceCertificate(cert(), {
      format: "DIGITAL_ECERTIDAO",
      isUnknownCartorio: false,
      hasApostille: false,
      uf: "SP",
    });
    expect(priced).toEqual({
      basePrice: 100,
      searchFee: 0,
      apostillePrice: 0,
      extrasPrice: 0,
      shippingPrice: 0,
      itemsSubtotal: 100,
      itemTotal: 100,
    });
  });

  it("soma busca, apostila e frete quando aplicáveis", () => {
    const priced = priceCertificate(cert(), {
      format: "PHYSICAL_PAPER",
      isUnknownCartorio: true,
      hasApostille: true,
      uf: "SP",
    });
    expect(priced.searchFee).toBe(30);
    expect(priced.apostillePrice).toBe(80);
    expect(priced.shippingPrice).toBe(25);
    expect(priced.itemsSubtotal).toBe(210);
    expect(priced.itemTotal).toBe(235);
  });

  it("ignora opções que o produto não oferece", () => {
    const priced = priceCertificate(
      cert({ hasSearchFee: false, hasApostilleOption: false, hasShippingOption: false }),
      { format: "BOTH", isUnknownCartorio: true, hasApostille: true, uf: "SP" }
    );
    expect(priced.itemTotal).toBe(100);
  });
});

describe("roundMoney", () => {
  it("arredonda para centavos", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(10.126)).toBe(10.13);
  });

  it("comportamento atual: ponto flutuante arredonda 1.005 para baixo", () => {
    expect(roundMoney(1.005)).toBe(1);
  });
});
