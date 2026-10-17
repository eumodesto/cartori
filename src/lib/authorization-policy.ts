import { OrganizationMemberRole, UserRole } from "@prisma/client";

/**
 * Pure authorization policy (no HTTP, no Prisma).
 *
 * platformRole (User.role): CLIENT | OPERATOR | ADMIN
 * orgRole + organizationId: OrganizationMember ACTIVE
 *
 * Role names are compared exactly. Never use role.includes("ADMIN").
 * OrganizationMemberRole.ADMIN is not UserRole.ADMIN.
 */
export const INTERNAL_ROLES = ["ADMIN", "OPERATOR"] as const;
export const TENANT_ROLES = ["CLIENT"] as const;
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
  /** Current tenant from the single ACTIVE membership. */
  organizationId: string | null;
  orgRole: OrganizationMemberRole | null;
  /** User.staffPermissions: áreas liberadas a um ADMIN restrito. Vazio = acesso total. */
  adminPermissions: string[];
};

export type OrganizationAccessOptions = {
  /** Explicit platform bypass. Never implied for OPERATOR. Default false. */
  allowGlobalAdmin?: boolean;
};

export function isInternalRole(role: UserRole): role is InternalRole {
  return role === "ADMIN" || role === "OPERATOR";
}

export function isTenantRole(role: UserRole): role is TenantRole {
  return role === "CLIENT";
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
  staffPermissions?: readonly string[];
}): AuthContext {
  const membership = pickSingleActiveMembership(input.activeMemberships);
  return {
    userId: input.userId,
    authId: input.authId,
    platformRole: input.platformRole,
    role: input.platformRole,
    organizationId: membership?.organizationId ?? null,
    orgRole: membership?.orgRole ?? null,
    adminPermissions: [...(input.staffPermissions ?? [])],
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

export function canAccessOwnedDossier(
  context: AuthContext,
  dossierUserId: string | null | undefined
): boolean {
  return Boolean(dossierUserId) && dossierUserId === context.userId;
}

/** Mesa operacional InterJuri. Não é OrganizationMemberRole.ADMIN. */
export function canOperateCases(context: AuthContext): boolean {
  return context.platformRole === "ADMIN" || context.platformRole === "OPERATOR";
}

/**
 * Administração global de usuários/clientes (InterJuri).
 * Apenas platformRole ADMIN. OPERATOR NÃO gerencia usuários (fail-closed).
 * Não confundir com OrganizationMemberRole.ADMIN.
 */
export function canManageUsers(context: AuthContext): boolean {
  return context.platformRole === "ADMIN";
}

export function canAccessOrderCase(
  context: AuthContext,
  orderUserId: string | null | undefined
): boolean {
  if (canOperateCases(context)) return true;
  return canAccessOwnedOrder(context, orderUserId);
}

export const STAFF_SETTABLE_ORDER_STATUSES = [
  "IN_ANALYSIS",
  "IN_CARTORIO_SEARCH",
  "WAITING_CUSTOMER",
  "CERTIFICATE_ISSUED",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type StaffSettableOrderStatus = (typeof STAFF_SETTABLE_ORDER_STATUSES)[number];

export function canStaffSetOrderStatus(status: string): status is StaffSettableOrderStatus {
  return (STAFF_SETTABLE_ORDER_STATUSES as readonly string[]).includes(status);
}

const POST_PAYMENT_STATUSES = new Set([
  "PAID",
  "IN_ANALYSIS",
  "IN_CARTORIO_SEARCH",
  "CERTIFICATE_ISSUED",
  "SHIPPED",
  "COMPLETED",
]);

/** Próximos status que a mesa pode gravar. Pagamento não entra aqui. */
const STAFF_STATUS_TRANSITIONS: Record<string, readonly StaffSettableOrderStatus[]> = {
  DRAFT: ["WAITING_CUSTOMER", "CANCELLED"],
  PENDING_PAYMENT: ["WAITING_CUSTOMER", "CANCELLED"],
  PAID: ["IN_ANALYSIS", "WAITING_CUSTOMER", "CANCELLED"],
  IN_ANALYSIS: ["IN_CARTORIO_SEARCH", "CERTIFICATE_ISSUED", "WAITING_CUSTOMER", "CANCELLED"],
  IN_CARTORIO_SEARCH: ["CERTIFICATE_ISSUED", "WAITING_CUSTOMER", "CANCELLED"],
  WAITING_CUSTOMER: ["IN_ANALYSIS", "IN_CARTORIO_SEARCH", "CANCELLED"],
  CERTIFICATE_ISSUED: ["SHIPPED", "COMPLETED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canStaffTransitionOrderStatus(
  from: string,
  to: string,
  options?: { hasApprovedPayment?: boolean }
): to is StaffSettableOrderStatus {
  if (!canStaffSetOrderStatus(to)) return false;
  const allowed = STAFF_STATUS_TRANSITIONS[from];
  if (!allowed?.includes(to)) return false;
  const settled = Boolean(options?.hasApprovedPayment) || POST_PAYMENT_STATUSES.has(from);
  const fulfillment = to !== "WAITING_CUSTOMER" && to !== "CANCELLED";
  if (!settled && fulfillment) return false;
  return true;
}

export function staffTransitionTargets(
  from: string,
  options?: { hasApprovedPayment?: boolean }
) {
  return STAFF_SETTABLE_ORDER_STATUSES.filter((status) =>
    canStaffTransitionOrderStatus(from, status, options)
  );
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
