import { OrganizationMemberRole, UserRole } from "@prisma/client";

/**
 * Pure authorization policy (no HTTP, no Prisma).
 *
 * INTERNAL Cartori: ADMIN, OPERATOR
 * TENANT / client:  CLIENT, B2B_ADMIN, B2B_MEMBER (platformRole legado)
 *
 * platformRole = User.role (Cartori / legado B2B_*).
 * orgRole + organizationId = OrganizationMember ACTIVE (fonte de verdade tenant).
 *
 * Role names are compared exactly. Never use role.includes("ADMIN").
 */
export const INTERNAL_ROLES = ["ADMIN", "OPERATOR"] as const;
export const TENANT_ROLES = ["CLIENT", "B2B_ADMIN", "B2B_MEMBER"] as const;
export const ORG_MANAGEMENT_ROLES = ["OWNER", "ADMIN"] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];

export type ActiveMembership = {
  organizationId: string;
  orgRole: OrganizationMemberRole;
};

export type AuthContext = {
  userId: string;
  authId: string;
  /** Platform role. Alias of platformRole for callers still using context.role. */
  role: UserRole;
  platformRole: UserRole;
  /** Current tenant from the single ACTIVE membership. Never from User.organizationId. */
  organizationId: string | null;
  orgRole: OrganizationMemberRole | null;
};

export type OrganizationAccessOptions = {
  /** Explicit platform bypass. Never implied for OPERATOR. Default false. */
  allowGlobalAdmin?: boolean;
};

export function isInternalRole(role: UserRole): role is InternalRole {
  return role === "ADMIN" || role === "OPERATOR";
}

export function isTenantRole(role: UserRole): role is TenantRole {
  return role === "CLIENT" || role === "B2B_ADMIN" || role === "B2B_MEMBER";
}

export function pickSingleActiveMembership(
  rows: readonly ActiveMembership[]
): ActiveMembership | null {
  return rows[0] ?? null;
}

export function buildAuthContext(input: {
  userId: string;
  authId: string;
  platformRole: UserRole;
  activeMemberships: readonly ActiveMembership[];
}): AuthContext {
  const membership = pickSingleActiveMembership(input.activeMemberships);
  return {
    userId: input.userId,
    authId: input.authId,
    platformRole: input.platformRole,
    role: input.platformRole,
    organizationId: membership?.organizationId ?? null,
    orgRole: membership?.orgRole ?? null,
  };
}

export function hasActiveMembership(context: AuthContext): boolean {
  return Boolean(context.organizationId && context.orgRole);
}

export function hasAllowedRole(
  context: AuthContext,
  allowed: readonly UserRole[]
): boolean {
  return allowed.includes(context.platformRole);
}

export function hasOrgRole(
  context: AuthContext,
  allowed: readonly OrganizationMemberRole[]
): boolean {
  return context.orgRole != null && allowed.includes(context.orgRole);
}

export function canAccessOrganization(
  context: AuthContext,
  organizationId: string | null | undefined,
  options: OrganizationAccessOptions = {}
): boolean {
  if (!organizationId) return false;
  if (options.allowGlobalAdmin === true && context.platformRole === "ADMIN") {
    return true;
  }
  if (!context.orgRole) return false;
  return context.organizationId === organizationId;
}

export function canOnboardBusiness(context: AuthContext): boolean {
  if (isInternalRole(context.platformRole)) return false;
  if (!hasActiveMembership(context)) {
    return context.platformRole === "CLIENT";
  }
  return hasOrgRole(context, ORG_MANAGEMENT_ROLES);
}

export function canAccessOwnedOrder(
  context: AuthContext,
  orderUserId: string | null | undefined
): boolean {
  return Boolean(orderUserId) && orderUserId === context.userId;
}

export function orderOwnerFromContext(context: AuthContext): {
  userId: string;
  organizationId: string | null;
} {
  return {
    userId: context.userId,
    organizationId: context.organizationId,
  };
}
