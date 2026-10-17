import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { areaLinksGroup, managementNavGroup } from "@/components/layout/area-links";
import { type AuthProfile, isPlatformAdminProfile, isStaffProfile } from "@/lib/auth-types";
import { buildAuthContext, canManageUsers, canOperateCases } from "@/lib/authorization-policy";

function profile(role: UserRole): AuthProfile {
  return {
    id: "u1",
    authId: "a1",
    email: "x@cartori.test",
    name: "X",
    phone: null,
    cpf: null,
    role,
    staffPermissions: [],
    avatarUrl: null,
    notificationPrefs: {},
    organization: null,
  };
}

const hrefs = (groups: ReturnType<typeof managementNavGroup>) =>
  groups.flatMap((group) => group.items.map((item) => item.href));

describe("helpers de papel da UI espelham a política do servidor", () => {
  it.each(Object.values(UserRole))("%s", (role) => {
    const context = buildAuthContext({
      userId: "u1",
      authId: "a1",
      platformRole: role,
      activeMemberships: [],
    });
    expect(isStaffProfile(profile(role))).toBe(canOperateCases(context));
    expect(isPlatformAdminProfile(profile(role))).toBe(canManageUsers(context));
  });

  it("sem perfil não é equipe nem admin", () => {
    expect(isStaffProfile(null)).toBe(false);
    expect(isPlatformAdminProfile(undefined)).toBe(false);
  });
});

describe("areaLinksGroup", () => {
  it("cliente no painel não vê atalhos internos", () => {
    expect(areaLinksGroup(profile("CLIENT"), "painel")).toEqual([]);
  });

  it("equipe no painel vê um atalho só para a Gestão", () => {
    for (const role of ["OPERATOR", "ADMIN"] as const) {
      expect(hrefs(areaLinksGroup(profile(role), "painel"))).toEqual(["/operacao/pedidos"]);
    }
  });

  it("dentro da Gestão (operação ou admin) o atalho é só o painel", () => {
    for (const area of ["operacao", "admin"] as const) {
      expect(hrefs(areaLinksGroup(profile("ADMIN"), area))).toEqual(["/painel"]);
      expect(hrefs(areaLinksGroup(profile("OPERATOR"), area))).toEqual(["/painel"]);
    }
  });
});

describe("managementNavGroup", () => {
  it("cliente não tem menu de gestão", () => {
    expect(managementNavGroup(profile("CLIENT"), "/painel")).toEqual([]);
  });

  it("operador vê só Pedidos", () => {
    expect(hrefs(managementNavGroup(profile("OPERATOR"), "/operacao/pedidos"))).toEqual(["/operacao/pedidos"]);
  });

  it("admin com acesso total vê as quatro entradas", () => {
    expect(hrefs(managementNavGroup(profile("ADMIN"), "/admin/usuarios"))).toEqual([
      "/operacao/pedidos",
      "/admin/usuarios",
      "/admin/emails",
      "/admin/configuracoes",
    ]);
  });

  it("admin restrito vê só as áreas liberadas", () => {
    const restricted = { ...profile("ADMIN"), staffPermissions: ["emails"] };
    expect(hrefs(managementNavGroup(restricted, "/admin/emails"))).toEqual([
      "/operacao/pedidos",
      "/admin/emails",
    ]);
  });
});
