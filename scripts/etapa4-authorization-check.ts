import { UserRole } from "@prisma/client";
import {
  buildAuthContext,
  canAccessOrganization,
  canAccessOwnedOrder,
  hasAllowedRole,
  isInternalRole,
  isTenantRole,
  type AuthContext,
} from "../src/lib/authorization-policy";
import { AUTHORIZATION_MATRIX } from "../src/lib/authorization-matrix";

function context(
  partial: Partial<AuthContext> & { role?: UserRole; platformRole?: UserRole }
): AuthContext {
  const platformRole = partial.platformRole ?? partial.role ?? "CLIENT";
  return buildAuthContext({
    userId: partial.userId ?? "user-a",
    authId: partial.authId ?? "auth-a",
    platformRole,
    activeMemberships:
      partial.orgRole && partial.organizationId
        ? [{ organizationId: partial.organizationId, orgRole: partial.orgRole }]
        : [],
  });
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const clientA = context({ role: "CLIENT", userId: "ua" });
const clientB = context({ role: "CLIENT", userId: "ub" });
const ownerA = context({
  role: "B2B_ADMIN",
  userId: "ua",
  organizationId: "org-a",
  orgRole: "OWNER",
});
const adminA = context({
  role: "CLIENT",
  userId: "uadmin",
  organizationId: "org-a",
  orgRole: "ADMIN",
});
const memberA = context({
  role: "B2B_MEMBER",
  userId: "um",
  organizationId: "org-a",
  orgRole: "MEMBER",
});
const legacyFkOnly = context({
  role: "B2B_ADMIN",
  userId: "ulegacy",
  organizationId: "org-a",
});
const operator = context({ role: "OPERATOR", userId: "op" });
const admin = context({ role: "ADMIN", userId: "ad" });

assert(isTenantRole("CLIENT") && isTenantRole("B2B_ADMIN") && isTenantRole("B2B_MEMBER"), "tenant roles");
assert(isInternalRole("ADMIN") && isInternalRole("OPERATOR"), "internal roles");
assert(!isInternalRole("B2B_ADMIN") && !isTenantRole("ADMIN"), "domains must not overlap");
assert(!isInternalRole("B2B_MEMBER") && !isTenantRole("OPERATOR"), "domains must not overlap");

assert(hasAllowedRole(admin, ["ADMIN"]), "admin allowlist");
assert(!hasAllowedRole(ownerA, ["ADMIN"]), "B2B_ADMIN is not ADMIN");
assert(!hasAllowedRole(operator, ["ADMIN"]), "OPERATOR is not ADMIN");
assert(!hasAllowedRole(clientA, ["B2B_ADMIN", "ADMIN"]), "CLIENT denied for admin-like allowlists");

assert(canAccessOwnedOrder(clientA, "ua"), "client owns own order");
assert(!canAccessOwnedOrder(clientB, "ua"), "client cannot own someone else's order");
assert(!canAccessOwnedOrder(ownerA, "other"), "org admin does not own by tenant");
assert(!canAccessOwnedOrder(admin, "ua"), "ADMIN has no implicit order bypass");
assert(!canAccessOwnedOrder(operator, "ua"), "OPERATOR has no implicit order bypass");

assert(!canAccessOrganization(clientA, "org-a"), "CLIENT without membership denied");
assert(canAccessOrganization(ownerA, "org-a"), "OWNER ACTIVE own org");
assert(!canAccessOrganization(ownerA, "org-b"), "OWNER other org denied");
assert(canAccessOrganization(adminA, "org-a"), "ADMIN ACTIVE own org");
assert(canAccessOrganization(memberA, "org-a"), "MEMBER ACTIVE recognized");
assert(!canAccessOrganization(memberA, "org-b"), "MEMBER other org denied");
assert(!canAccessOrganization(legacyFkOnly, "org-a"), "legacy organizationId without membership denied");
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
