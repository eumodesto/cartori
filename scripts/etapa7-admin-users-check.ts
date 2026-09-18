import { UserRole, OrganizationMemberRole } from "@prisma/client";
import {
  buildAuthContext,
  canManageUsers,
  type AuthContext,
} from "../src/lib/authorization-policy";

function context(partial: {
  role?: UserRole;
  userId?: string;
  organizationId?: string;
  orgRole?: OrganizationMemberRole;
}): AuthContext {
  const platformRole = partial.role ?? "CLIENT";
  return buildAuthContext({
    userId: partial.userId ?? "user-a",
    authId: "auth-a",
    platformRole,
    activeMemberships:
      partial.orgRole && partial.organizationId
        ? [{ organizationId: partial.organizationId, orgRole: partial.orgRole }]
        : [],
  });
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`ok: ${message}`);
}

// Somente platformRole ADMIN gerencia usuários. Fail-closed para os demais.
assert(canManageUsers(context({ role: "ADMIN" })) === true, "ADMIN gerencia usuários");
assert(canManageUsers(context({ role: "OPERATOR" })) === false, "OPERATOR NÃO gerencia usuários");
assert(canManageUsers(context({ role: "CLIENT" })) === false, "CLIENT NÃO gerencia usuários");

// OrganizationMemberRole.ADMIN/OWNER não concede gestão de plataforma.
assert(
  canManageUsers(
    context({ role: "CLIENT", organizationId: "org-a", orgRole: "ADMIN" })
  ) === false,
  "orgRole ADMIN (CLIENT) NÃO gerencia usuários da plataforma"
);
assert(
  canManageUsers(
    context({ role: "CLIENT", organizationId: "org-a", orgRole: "OWNER" })
  ) === false,
  "orgRole OWNER (CLIENT) NÃO gerencia usuários da plataforma"
);

console.log("\netapa7-admin-users-check: PASSOU");
