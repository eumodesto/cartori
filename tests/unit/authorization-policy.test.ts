import type { OrganizationMemberRole, UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  buildAuthContext,
  canAccessOrderCase,
  canAccessOrganization,
  canAccessOwnedDossier,
  canAccessOwnedOrder,
  canManageUsers,
  canOnboardBusiness,
  canOperateCases,
  canStaffSetOrderStatus,
  canStaffTransitionOrderStatus,
  hasActiveMembership,
  hasAllowedRole,
  hasOrgRole,
  isInternalRole,
  isTenantRole,
  orderOwnerFromContext,
  pickSingleActiveMembership,
  staffTransitionTargets,
} from "@/lib/authorization-policy";

function ctx(input: {
  platformRole: UserRole;
  userId?: string;
  memberships?: Array<{ organizationId: string; orgRole: OrganizationMemberRole }>;
}) {
  return buildAuthContext({
    userId: input.userId ?? "user-a",
    authId: "auth-a",
    platformRole: input.platformRole,
    activeMemberships: input.memberships ?? [],
  });
}

const clientA = ctx({ platformRole: "CLIENT", userId: "ua" });
const clientB = ctx({ platformRole: "CLIENT", userId: "ub" });
const ownerA = ctx({
  platformRole: "CLIENT",
  userId: "ua",
  memberships: [{ organizationId: "org-a", orgRole: "OWNER" }],
});
const orgAdminA = ctx({
  platformRole: "CLIENT",
  userId: "uadmin",
  memberships: [{ organizationId: "org-a", orgRole: "ADMIN" }],
});
const memberA = ctx({
  platformRole: "CLIENT",
  userId: "um",
  memberships: [{ organizationId: "org-a", orgRole: "MEMBER" }],
});
const operator = ctx({ platformRole: "OPERATOR", userId: "op" });
const admin = ctx({ platformRole: "ADMIN", userId: "ad" });

describe("papéis de plataforma", () => {
  it("separa papéis internos e de tenant", () => {
    expect(isTenantRole("CLIENT")).toBe(true);
    expect(isInternalRole("ADMIN")).toBe(true);
    expect(isInternalRole("OPERATOR")).toBe(true);
    expect(isInternalRole("CLIENT")).toBe(false);
    expect(isTenantRole("ADMIN")).toBe(false);
    expect(isTenantRole("OPERATOR")).toBe(false);
  });

  it("compara allowlist pelo platformRole, nunca pelo orgRole", () => {
    expect(hasAllowedRole(admin, ["ADMIN"])).toBe(true);
    expect(hasAllowedRole(ownerA, ["ADMIN"])).toBe(false);
    expect(hasAllowedRole(orgAdminA, ["ADMIN"])).toBe(false);
    expect(hasAllowedRole(operator, ["ADMIN"])).toBe(false);
    expect(hasAllowedRole(clientA, ["ADMIN"])).toBe(false);
  });

  it("mantém platformRole CLIENT para quem tem orgRole", () => {
    expect(ownerA.platformRole).toBe("CLIENT");
    expect(orgAdminA.platformRole).toBe("CLIENT");
    expect(orgAdminA.orgRole).toBe("ADMIN");
  });

  it("só ADMIN de plataforma gerencia usuários", () => {
    expect(canManageUsers(admin)).toBe(true);
    expect(canManageUsers(operator)).toBe(false);
    expect(canManageUsers(clientA)).toBe(false);
    expect(canManageUsers(orgAdminA)).toBe(false);
    expect(canManageUsers(ownerA)).toBe(false);
  });
});

describe("membership", () => {
  it("reconhece membership ACTIVE e papéis de gestão", () => {
    expect(hasActiveMembership(clientA)).toBe(false);
    expect(hasActiveMembership(ownerA)).toBe(true);
    expect(hasOrgRole(ownerA, ["OWNER"])).toBe(true);
    expect(hasOrgRole(memberA, ["OWNER", "ADMIN"])).toBe(false);
  });

  it("usa a primeira membership quando há mais de uma (comportamento atual)", () => {
    const picked = pickSingleActiveMembership([
      { organizationId: "org-old", orgRole: "OWNER" },
      { organizationId: "org-new", orgRole: "MEMBER" },
    ]);
    expect(picked?.organizationId).toBe("org-old");
  });
});

describe("acesso à organização", () => {
  it("exige membership ACTIVE na mesma org", () => {
    expect(canAccessOrganization(clientA, "org-a")).toBe(false);
    expect(canAccessOrganization(ownerA, "org-a")).toBe(true);
    expect(canAccessOrganization(ownerA, "org-b")).toBe(false);
    expect(canAccessOrganization(orgAdminA, "org-a")).toBe(true);
    expect(canAccessOrganization(memberA, "org-a")).toBe(true);
    expect(canAccessOrganization(memberA, "org-b")).toBe(false);
  });

  it("nega org vazia", () => {
    expect(canAccessOrganization(ownerA, null)).toBe(false);
    expect(canAccessOrganization(ownerA, "")).toBe(false);
  });

  it("bypass global só para ADMIN e só quando explícito", () => {
    expect(canAccessOrganization(admin, "org-a")).toBe(false);
    expect(canAccessOrganization(admin, "org-a", { allowGlobalAdmin: true })).toBe(true);
    expect(canAccessOrganization(operator, "org-a")).toBe(false);
    expect(canAccessOrganization(operator, "org-a", { allowGlobalAdmin: true })).toBe(false);
  });
});

describe("onboarding empresarial", () => {
  it("permite CLIENT sem membership e OWNER/ADMIN da org", () => {
    expect(canOnboardBusiness(clientA)).toBe(true);
    expect(canOnboardBusiness(ownerA)).toBe(true);
    expect(canOnboardBusiness(orgAdminA)).toBe(true);
  });

  it("nega MEMBER e equipe InterJuri", () => {
    expect(canOnboardBusiness(memberA)).toBe(false);
    expect(canOnboardBusiness(admin)).toBe(false);
    expect(canOnboardBusiness(operator)).toBe(false);
  });
});

describe("posse de pedido e dossiê", () => {
  it("pedido só pelo userId, sem bypass por papel ou tenant", () => {
    expect(canAccessOwnedOrder(clientA, "ua")).toBe(true);
    expect(canAccessOwnedOrder(clientB, "ua")).toBe(false);
    expect(canAccessOwnedOrder(ownerA, "other")).toBe(false);
    expect(canAccessOwnedOrder(memberA, "ua")).toBe(false);
    expect(canAccessOwnedOrder(admin, "ua")).toBe(false);
    expect(canAccessOwnedOrder(operator, "ua")).toBe(false);
  });

  it("pedido sem dono é negado", () => {
    expect(canAccessOwnedOrder(clientA, null)).toBe(false);
    expect(canAccessOwnedOrder(clientA, undefined)).toBe(false);
    expect(canAccessOwnedOrder(clientA, "")).toBe(false);
  });

  it("dossiê segue a mesma regra", () => {
    expect(canAccessOwnedDossier(clientA, "ua")).toBe(true);
    expect(canAccessOwnedDossier(clientB, "ua")).toBe(false);
    expect(canAccessOwnedDossier(ownerA, "other")).toBe(false);
    expect(canAccessOwnedDossier(memberA, "ua")).toBe(false);
    expect(canAccessOwnedDossier(admin, "ua")).toBe(false);
    expect(canAccessOwnedDossier(operator, "ua")).toBe(false);
  });

  it("dono do pedido novo vem do contexto", () => {
    expect(orderOwnerFromContext(ownerA)).toEqual({ userId: "ua", organizationId: "org-a" });
    expect(orderOwnerFromContext(clientB)).toEqual({ userId: "ub", organizationId: null });
  });
});

describe("mesa operacional", () => {
  it("só equipe InterJuri opera casos", () => {
    expect(canOperateCases(admin)).toBe(true);
    expect(canOperateCases(operator)).toBe(true);
    expect(canOperateCases(clientA)).toBe(false);
    expect(canOperateCases(ownerA)).toBe(false);
  });

  it("caso do pedido: dono ou equipe", () => {
    expect(canAccessOrderCase(clientA, "ua")).toBe(true);
    expect(canAccessOrderCase(clientB, "ua")).toBe(false);
    expect(canAccessOrderCase(admin, "ua")).toBe(true);
    expect(canAccessOrderCase(operator, "ua")).toBe(true);
  });

  it("mesa não grava status de pagamento", () => {
    expect(canStaffSetOrderStatus("WAITING_CUSTOMER")).toBe(true);
    expect(canStaffSetOrderStatus("PAID")).toBe(false);
    expect(canStaffSetOrderStatus("PENDING_PAYMENT")).toBe(false);
    expect(canStaffSetOrderStatus("DRAFT")).toBe(false);
  });
});

describe("transições de status pela mesa", () => {
  it.each([
    ["PENDING_PAYMENT", "CANCELLED", true],
    ["PENDING_PAYMENT", "WAITING_CUSTOMER", true],
    ["PENDING_PAYMENT", "CERTIFICATE_ISSUED", false],
    ["PENDING_PAYMENT", "IN_ANALYSIS", false],
    ["PAID", "IN_ANALYSIS", true],
    ["PAID", "CERTIFICATE_ISSUED", false],
    ["IN_ANALYSIS", "CERTIFICATE_ISSUED", true],
    ["WAITING_CUSTOMER", "IN_ANALYSIS", false],
    ["COMPLETED", "CANCELLED", false],
    ["CANCELLED", "IN_ANALYSIS", false],
  ])("%s → %s = %s", (from, to, expected) => {
    expect(canStaffTransitionOrderStatus(from, to)).toBe(expected);
  });

  it("aguardando cliente com pagamento aprovado pode voltar à análise", () => {
    expect(
      canStaffTransitionOrderStatus("WAITING_CUSTOMER", "IN_ANALYSIS", { hasApprovedPayment: true })
    ).toBe(true);
  });

  it("status desconhecido é negado (fail-closed)", () => {
    expect(canStaffTransitionOrderStatus("UNKNOWN", "CANCELLED")).toBe(false);
    expect(canStaffTransitionOrderStatus("PAID", "UNKNOWN")).toBe(false);
  });

  it("alvos possíveis de um pedido não pago", () => {
    expect(staffTransitionTargets("PENDING_PAYMENT")).toEqual(["WAITING_CUSTOMER", "CANCELLED"]);
  });

  it("pedidos terminais não têm alvos", () => {
    expect(staffTransitionTargets("COMPLETED")).toEqual([]);
    expect(staffTransitionTargets("CANCELLED")).toEqual([]);
  });
});
