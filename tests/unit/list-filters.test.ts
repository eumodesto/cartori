import { describe, expect, it } from "vitest";
import { canUseBusinessFeatures, type AuthProfile } from "@/lib/auth-types";
import { csvCell, toCsv } from "@/lib/csv";
import { countBy, inPeriod, matchesSearch } from "@/lib/list-filters";
import { certificateOptions, inOrderCategory } from "@/lib/order-categories";

describe("matchesSearch", () => {
  it("ignora acento e caixa, e exige todos os termos", () => {
    expect(matchesSearch("joao matricula", ["João Silva", "Certidão de Matrícula"])).toBe(true);
    expect(matchesSearch("joao onus", ["João Silva", "Certidão de Matrícula"])).toBe(false);
    expect(matchesSearch("  ", ["qualquer"])).toBe(true);
  });
});

describe("inPeriod", () => {
  const now = new Date("2026-10-17T15:00:00");
  it("hoje começa à meia-noite; vazio não filtra", () => {
    expect(inPeriod("2026-10-17T00:30:00", "1", now)).toBe(true);
    expect(inPeriod("2026-10-16T23:59:00", "1", now)).toBe(false);
    expect(inPeriod("2020-01-01T00:00:00", "", now)).toBe(true);
  });
  it("últimos 7 dias inclui hoje e os 6 anteriores", () => {
    expect(inPeriod("2026-10-11T08:00:00", "7", now)).toBe(true);
    expect(inPeriod("2026-10-10T23:00:00", "7", now)).toBe(false);
  });
});

describe("categorias e opções", () => {
  it("categoria vazia aceita tudo; cancelados agrupam recusado e estornado", () => {
    expect(inOrderCategory("", "DELIVERED")).toBe(true);
    expect(inOrderCategory("closed", "REFUNDED")).toBe(true);
    expect(inOrderCategory("closed", "PAYMENT_REJECTED")).toBe(true);
    expect(inOrderCategory("payment", "DELIVERED")).toBe(false);
  });
  it("certidões únicas e em ordem", () => {
    expect(certificateOptions([{ certificates: ["Ônus", "Matrícula"] }, { certificates: ["Matrícula"] }])).toEqual([
      { value: "", label: "Todas as certidões" },
      { value: "Matrícula", label: "Matrícula" },
      { value: "Ônus", label: "Ônus" },
    ]);
  });
  it("countBy conta por chave", () => {
    expect(countBy(["a", "b", "a"], (x) => x).get("a")).toBe(2);
  });
});

describe("csv", () => {
  it("neutraliza fórmula e escapa aspas", () => {
    expect(csvCell("=1+1")).toBe(`"'=1+1"`);
    expect(csvCell('diz "oi"')).toBe(`"diz ""oi"""`);
    expect(csvCell(null)).toBe(`""`);
  });
  it("BOM, ; e CRLF", () => {
    expect(toCsv(["A", "B"], [[1, "x"]])).toBe(`﻿"A";"B"\r\n"1";"x"`);
  });
});

describe("canUseBusinessFeatures", () => {
  const base: AuthProfile = {
    id: "u1",
    authId: "a1",
    email: "a@example.invalid",
    name: null,
    phone: null,
    cpf: null,
    role: "CLIENT",
    staffPermissions: [],
    avatarUrl: null,
    notificationPrefs: {},
    organization: null,
  };
  it("admin vê os recursos de empresa; operador e cliente sem empresa não", () => {
    expect(canUseBusinessFeatures({ ...base, role: "ADMIN" })).toBe(true);
    expect(canUseBusinessFeatures({ ...base, role: "OPERATOR" })).toBe(false);
    expect(canUseBusinessFeatures(base)).toBe(false);
    expect(canUseBusinessFeatures(null)).toBe(false);
  });
});
