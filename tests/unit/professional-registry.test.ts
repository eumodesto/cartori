import { describe, expect, it } from "vitest";
import {
  formatProfessionalRegistry,
  isProfessionalRegistryKind,
  normalizeRegistryNumber,
} from "@/lib/professional-registry";

describe("registro profissional", () => {
  it("aceita só OAB e CRECI", () => {
    expect(isProfessionalRegistryKind("OAB")).toBe(true);
    expect(isProfessionalRegistryKind("CRECI")).toBe(true);
    expect(isProfessionalRegistryKind("oab")).toBe(false);
    expect(isProfessionalRegistryKind(null)).toBe(false);
  });

  it("normaliza o número", () => {
    expect(normalizeRegistryNumber(" 123.456 ")).toBe("123456");
    expect(normalizeRegistryNumber("12345-j")).toBe("12345-J");
    expect(normalizeRegistryNumber("1234567890123456")).toHaveLength(12);
  });

  it("formata com UF válida", () => {
    expect(formatProfessionalRegistry("OAB", "sp", "123456")).toBe("OAB/SP 123456");
    expect(formatProfessionalRegistry("CRECI", "DF", "12345-j")).toBe("CRECI/DF 12345-J");
  });

  it("recusa UF ou número inválidos", () => {
    expect(formatProfessionalRegistry("OAB", "XX", "123456")).toBeNull();
    expect(formatProfessionalRegistry("OAB", "SP", "")).toBeNull();
    expect(formatProfessionalRegistry("OAB", "SP", "123456789")).toBeNull();
    expect(formatProfessionalRegistry("CRECI", "SP", "ABC")).toBeNull();
  });
});
