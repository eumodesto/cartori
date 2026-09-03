import { UserRole } from "@prisma/client";
import {
  canAccessOrganization,
  canAccessOwnedOrder,
  hasAllowedRole,
  isInternalRole,
  isTenantRole,
  type AuthContext,
} from "../src/lib/authorization-policy";
import { AUTHORIZATION_MATRIX } from "../src/lib/authorization-matrix";

function context(partial: Partial<AuthContext> & Pick<AuthContext, "role">): AuthContext {
  return {
    userId: partial.userId ?? "user-a",
    authId: partial.authId ?? "auth-a",
    role: partial.role,
    organizationId: partial.organizationId ?? null,
  };
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const clientA = context({ role: "CLIENT", userId: "ua", organizationId: null });
const clientB = context({ role: "CLIENT", userId: "ub", organizationId: null });
const b2bAdminA = context({ role: "B2B_ADMIN", userId: "ua", organizationId: "org-a" });
const b2bMemberA = context({ role: "B2B_MEMBER", userId: "um", organizationId: "org-a" });
const operator = context({ role: "OPERATOR", userId: "op", organizationId: null });
const admin = context({ role: "ADMIN", userId: "ad", organizationId: null });

assert(isTenantRole("CLIENT") && isTenantRole("B2B_ADMIN") && isTenantRole("B2B_MEMBER"), "tenant roles");
assert(isInternalRole("ADMIN") && isInternalRole("OPERATOR"), "internal roles");
assert(!isInternalRole("B2B_ADMIN") && !isTenantRole("ADMIN"), "domains must not overlap");
assert(!isInternalRole("B2B_MEMBER") && !isTenantRole("OPERATOR"), "domains must not overlap");

assert(hasAllowedRole(admin, ["ADMIN"]), "admin allowlist");
assert(!hasAllowedRole(b2bAdminA, ["ADMIN"]), "B2B_ADMIN is not ADMIN");
assert(!hasAllowedRole(operator, ["ADMIN"]), "OPERATOR is not ADMIN");
assert(!hasAllowedRole(clientA, ["B2B_ADMIN", "ADMIN"]), "CLIENT denied for admin-like allowlists");

assert(canAccessOwnedOrder(clientA, "ua"), "client owns own order");
assert(!canAccessOwnedOrder(clientB, "ua"), "client cannot own someone else's order");
assert(!canAccessOwnedOrder(b2bAdminA, "other"), "org admin does not own by tenant");
assert(!canAccessOwnedOrder(admin, "ua"), "ADMIN has no implicit order bypass");
assert(!canAccessOwnedOrder(operator, "ua"), "OPERATOR has no implicit order bypass");

assert(!canAccessOrganization(clientA, "org-a"), "CLIENT without org denied");
assert(canAccessOrganization(b2bAdminA, "org-a"), "B2B_ADMIN own org");
assert(!canAccessOrganization(b2bAdminA, "org-b"), "B2B_ADMIN other org denied");
assert(canAccessOrganization(b2bMemberA, "org-a"), "membership match is tenant equality only");
assert(!canAccessOrganization(b2bMemberA, "org-b"), "B2B_MEMBER other org denied");
assert(!canAccessOrganization(operator, "org-a"), "OPERATOR no org bypass");
assert(!canAccessOrganization(admin, "org-a"), "ADMIN bypass default off");
assert(
  canAccessOrganization(admin, "org-a", { allowGlobalAdmin: true }),
  "ADMIN bypass only when explicit"
);
assert(
  !canAccessOrganization(operator, "org-a", { allowGlobalAdmin: true }),
  "OPERATOR does not inherit ADMIN bypass"
);

const roles: UserRole[] = ["CLIENT", "B2B_ADMIN", "B2B_MEMBER", "OPERATOR", "ADMIN"];
for (const row of AUTHORIZATION_MATRIX) {
  for (const role of roles) {
    const decision = row[role];
    assert(
      decision === "ALLOW" ||
        decision === "DENY" ||
        decision === "FUTURE" ||
        decision === "TBD",
      `matrix ${row.resource} ${role}`
    );
  }
}

const partner = AUTHORIZATION_MATRIX.find((row) =>
  row.resource.includes("POST /api/org/partner")
);
assert(partner?.CLIENT === "ALLOW", "partner CLIENT documented");
assert(partner?.B2B_MEMBER === "DENY", "partner B2B_MEMBER fail-closed");
assert(partner?.OPERATOR === "DENY" && partner?.ADMIN === "DENY", "partner internal denied");

console.log("etapa4-authorization-check: PASS");
