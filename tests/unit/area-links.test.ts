import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { areaLinksGroup } from "@/components/layout/area-links";
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
    avatarUrl: null,
    notificationPrefs: {},
    organization: null,
  };
}

const hrefs = (groups: ReturnType<typeof areaLinksGroup>) =>
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

  it("operador no painel vê só a mesa operacional", () => {
    expect(hrefs(areaLinksGroup(profile("OPERATOR"), "painel"))).toEqual(["/operacao/pedidos"]);
  });

  it("operador na mesa não vê administração", () => {
    expect(hrefs(areaLinksGroup(profile("OPERATOR"), "operacao"))).toEqual(["/painel"]);
  });

  it("admin vê as outras duas áreas, nunca a atual", () => {
    expect(hrefs(areaLinksGroup(profile("ADMIN"), "painel"))).toEqual([
      "/operacao/pedidos",
      "/admin/usuarios",
    ]);
    expect(hrefs(areaLinksGroup(profile("ADMIN"), "operacao"))).toEqual([
      "/painel",
      "/admin/usuarios",
    ]);
    expect(hrefs(areaLinksGroup(profile("ADMIN"), "admin"))).toEqual([
      "/painel",
      "/operacao/pedidos",
    ]);
  });
});
