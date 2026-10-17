import { describe, expect, it } from "vitest";
import {
  canRegisterCompany,
  isBusinessAccount,
  isBusinessLockedHref,
  isPartnerAccount,
  type AuthOrganization,
  type AuthProfile,
} from "@/lib/auth-types";

const organization: AuthOrganization = {
  id: "org-a",
  name: "Empresa A",
  tradeName: null,
  cnpj: "00000000000000",
  plan: "STANDARD",
  cnpjVerifiedAt: "2026-10-01T00:00:00.000Z",
  cnpjStatus: "ATIVA",
  city: null,
  state: null,
};

function profile(overrides: Partial<AuthProfile> = {}): AuthProfile {
  return {
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
    ...overrides,
  };
}

describe("isBusinessAccount", () => {
  it("depende da organização vinda da membership", () => {
    expect(isBusinessAccount(profile())).toBe(false);
    expect(isBusinessAccount(profile({ organization }))).toBe(true);
    expect(isBusinessAccount(null)).toBe(false);
  });
});

describe("isPartnerAccount", () => {
  it("exige plano PARTNER e CNPJ verificado", () => {
    expect(isPartnerAccount(profile({ organization }))).toBe(false);
    expect(
      isPartnerAccount(profile({ organization: { ...organization, plan: "PARTNER" } }))
    ).toBe(true);
    expect(
      isPartnerAccount(
        profile({ organization: { ...organization, plan: "PARTNER", cnpjVerifiedAt: null } })
      )
    ).toBe(false);
  });
});

describe("canRegisterCompany", () => {
  it("só CLIENT sem empresa", () => {
    expect(canRegisterCompany(profile())).toBe(true);
    expect(canRegisterCompany(profile({ organization }))).toBe(false);
    expect(canRegisterCompany(profile({ role: "ADMIN" }))).toBe(false);
    expect(canRegisterCompany(profile({ role: "OPERATOR" }))).toBe(false);
    expect(canRegisterCompany(null)).toBe(false);
  });
});

describe("isBusinessLockedHref", () => {
  it("bloqueia rotas B2B e subrotas", () => {
    expect(isBusinessLockedHref("/painel/equipe")).toBe(true);
    expect(isBusinessLockedHref("/painel/financeiro/notas")).toBe(true);
    expect(isBusinessLockedHref("/painel/pedidos")).toBe(false);
    expect(isBusinessLockedHref("/painel/equipe-x")).toBe(false);
  });
});
