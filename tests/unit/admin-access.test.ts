import { describe, expect, it } from "vitest";
import {
  accessLevelLabel,
  canUseAdminResource,
  hasAdminPermission,
  hasFullAdminAccess,
  permissionForAdminResource,
  sanitizeAdminPermissions,
} from "@/lib/admin-permissions";
import { normalizeAccess, userChangeError } from "@/lib/admin-user-rules";

const full = { userId: "owner", role: "ADMIN" as const, permissions: [] as string[] };
const restricted = { userId: "helper", role: "ADMIN" as const, permissions: ["users"] };

describe("permissões de administrador", () => {
  it("lista vazia é acesso total; OPERATOR e CLIENT nunca têm permissão", () => {
    expect(hasFullAdminAccess("ADMIN", [])).toBe(true);
    expect(hasFullAdminAccess("ADMIN", ["users"])).toBe(false);
    expect(hasAdminPermission("ADMIN", [], "payments")).toBe(true);
    expect(hasAdminPermission("ADMIN", ["emails"], "payments")).toBe(false);
    expect(hasAdminPermission("OPERATOR", [], "users")).toBe(false);
    expect(hasAdminPermission("CLIENT", [], "users")).toBe(false);
  });

  it("cada gate do servidor tem a sua permissão; recurso sem mapa exige acesso total", () => {
    expect(permissionForAdminResource("admin.users")).toBe("users");
    expect(permissionForAdminResource("admin.users.orders")).toBe("users");
    expect(permissionForAdminResource("admin.email")).toBe("emails");
    expect(permissionForAdminResource("admin.tracking")).toBe("settings");
    expect(permissionForAdminResource("admin.orders.status")).toBe("payments");
    expect(permissionForAdminResource("ops.orders.delete")).toBe("orders_delete");
    expect(canUseAdminResource("ADMIN", ["users"], "admin.algo-novo")).toBe(false);
    expect(canUseAdminResource("ADMIN", [], "admin.algo-novo")).toBe(true);
  });

  it("sanitiza a lista do corpo", () => {
    expect(sanitizeAdminPermissions(["users", "users", "emails"])).toEqual(["users", "emails"]);
    expect(sanitizeAdminPermissions(["root"])).toBeNull();
    expect(sanitizeAdminPermissions("users")).toBeNull();
  });

  it("rótulo mostra se o administrador é restrito", () => {
    expect(accessLevelLabel("ADMIN", [])).toBe("Administrador · acesso total");
    expect(accessLevelLabel("ADMIN", ["emails"])).toBe("Administrador · restrito");
    expect(accessLevelLabel("OPERATOR", [])).toBe("Operador");
  });

  it("permissões só valem para ADMIN", () => {
    expect(normalizeAccess("OPERATOR", ["users"])).toEqual({ role: "OPERATOR", permissions: [] });
    expect(normalizeAccess("ADMIN", ["users"])).toEqual({ role: "ADMIN", permissions: ["users"] });
  });
});

describe("userChangeError", () => {
  const client = { id: "c1", role: "CLIENT" as const, permissions: [] };
  const otherFull = { id: "a2", role: "ADMIN" as const, permissions: [] };

  it("acesso total cadastra administrador; restrito não", () => {
    const next = { role: "ADMIN" as const, permissions: [] };
    expect(userChangeError({ actor: full, target: null, next, fullAdminCount: 1 })).toBeNull();
    expect(userChangeError({ actor: restricted, target: null, next, fullAdminCount: 1 })).toMatch(/acesso total/);
  });

  it("restrito cadastra e promove cliente a operador", () => {
    const next = { role: "OPERATOR" as const, permissions: [] };
    expect(userChangeError({ actor: restricted, target: null, next, fullAdminCount: 1 })).toBeNull();
    expect(userChangeError({ actor: restricted, target: client, next, fullAdminCount: 1 })).toBeNull();
  });

  it("restrito não altera nem exclui administrador", () => {
    expect(
      userChangeError({ actor: restricted, target: otherFull, next: { role: "CLIENT", permissions: [] }, fullAdminCount: 2 })
    ).toMatch(/acesso total/);
    expect(userChangeError({ actor: restricted, target: otherFull, next: null, fullAdminCount: 2 })).toMatch(/acesso total/);
  });

  it("ninguém muda o próprio nível nem se exclui", () => {
    const self = { id: "owner", role: "ADMIN" as const, permissions: [] };
    expect(
      userChangeError({ actor: full, target: self, next: { role: "ADMIN", permissions: ["users"] }, fullAdminCount: 2 })
    ).toMatch(/próprio nível/);
    expect(userChangeError({ actor: full, target: self, next: null, fullAdminCount: 2 })).toMatch(/própria conta/);
    expect(
      userChangeError({ actor: full, target: self, next: { role: "ADMIN", permissions: [] }, fullAdminCount: 1 })
    ).toBeNull();
  });

  it("não deixa a plataforma sem administrador com acesso total", () => {
    expect(userChangeError({ actor: full, target: otherFull, next: null, fullAdminCount: 1 })).toMatch(/único/);
    expect(
      userChangeError({ actor: full, target: otherFull, next: { role: "ADMIN", permissions: ["emails"] }, fullAdminCount: 1 })
    ).toMatch(/único/);
    expect(userChangeError({ actor: full, target: otherFull, next: null, fullAdminCount: 2 })).toBeNull();
  });
});
