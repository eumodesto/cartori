import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { chargeAmountNumber, moneyToCents } from "@/lib/money-cents";

describe("moneyToCents", () => {
  it("converte Decimal, número e texto", () => {
    expect(moneyToCents(new Prisma.Decimal("123.45"))).toBe(12345);
    expect(moneyToCents(123.45)).toBe(12345);
    expect(moneyToCents("123.4")).toBe(12340);
    expect(moneyToCents(0)).toBe(0);
  });

  it("arredonda meio centavo para cima, sem erro de ponto flutuante", () => {
    expect(moneyToCents("1.005")).toBe(101);
    expect(moneyToCents(1.005)).toBe(101);
    expect(moneyToCents("10.004")).toBe(1000);
  });

  it("valores iguais em reais dão os mesmos centavos", () => {
    expect(moneyToCents(0.1 + 0.2)).toBe(moneyToCents("0.30"));
  });
});

describe("chargeAmountNumber", () => {
  it("devolve número com duas casas", () => {
    expect(chargeAmountNumber(new Prisma.Decimal("99.999"))).toBe(100);
    expect(chargeAmountNumber("45.1")).toBe(45.1);
  });
});
