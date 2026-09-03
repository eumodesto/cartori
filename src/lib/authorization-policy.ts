import { UserRole } from "@prisma/client";

/**
 * Pure authorization policy (no HTTP, no Prisma).
 *
 * INTERNAL Cartori: ADMIN, OPERATOR
 * TENANT / client:  CLIENT, B2B_ADMIN, B2B_MEMBER
 *
 * Role names are compared exactly. Never use role.includes("ADMIN").
 */
export const INTERNAL_ROLES = ["ADMIN", "OPERATOR"] as const;
export const TENANT_ROLES = ["CLIENT", "B2B_ADMIN", "B2B_MEMBER"] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];

export type AuthContext = {
  userId: string;
  authId: string;
  role: UserRole;
  organizationId: string | null;
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

export function hasAllowedRole(
  context: AuthContext,
  allowed: readonly UserRole[]
): boolean {
  return allowed.includes(context.role);
}

export function canAccessOrganization(
  context: AuthContext,
  organizationId: string | null | undefined,
  options: OrganizationAccessOptions = {}
): boolean {
  if (!organizationId) return false;
  if (options.allowGlobalAdmin === true && context.role === "ADMIN") {
    return true;
  }
  return context.organizationId === organizationId;
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
