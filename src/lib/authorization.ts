import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  type AuthContext,
  type OrganizationAccessOptions,
  buildAuthContext,
  canAccessOrganization,
  canOnboardBusiness,
  hasAllowedRole,
} from "@/lib/authorization-policy";

export {
  INTERNAL_ROLES,
  TENANT_ROLES,
  buildAuthContext,
  canAccessOrganization,
  canAccessOwnedOrder,
  canOnboardBusiness,
  hasActiveMembership,
  hasAllowedRole,
  hasOrgRole,
  isInternalRole,
  isTenantRole,
  orderOwnerFromContext,
  pickSingleActiveMembership,
  type AuthContext,
  type InternalRole,
  type OrganizationAccessOptions,
  type TenantRole,
} from "@/lib/authorization-policy";

/**
 * Authorization (Etapa 6B).
 *
 * Identity: Supabase session + Prisma User (authId).
 * platformRole: User.role (never from the browser).
 * Tenant: OrganizationMember ACTIVE (never User.organizationId / B2B_*).
 *
 * Fail-closed: unknown capability → deny. OPERATOR does not inherit ADMIN bypass.
 * REMOVED membership disappears from the query, so the next request loses access.
 */
export type AuthOk = { ok: true; context: AuthContext };
export type AuthDenied = { ok: false; response: NextResponse };
export type AuthResult = AuthOk | AuthDenied;

export function logAuthzDeny(info: {
  userId?: string | null;
  role?: UserRole | string | null;
  orgRole?: string | null;
  resourceType: string;
  resourceId?: string | null;
  reason: string;
}) {
  console.warn("[authz] deny", {
    userId: info.userId ?? null,
    role: info.role ?? null,
    orgRole: info.orgRole ?? null,
    resourceType: info.resourceType,
    resourceId: info.resourceId ?? null,
    reason: info.reason,
  });
}

function errorJson(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

export function unauthorizedResponse(
  error = "Entre na conta para continuar."
) {
  return errorJson(401, error);
}

export function forbiddenResponse(
  error = "Você não tem permissão para esta ação."
) {
  return errorJson(403, error);
}

export function privateNotFoundResponse(
  error = "Recurso não encontrado."
) {
  return errorJson(404, error);
}

export async function requireAuth(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    logAuthzDeny({ resourceType: "session", reason: "supabase_unconfigured" });
    return { ok: false, response: unauthorizedResponse() };
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    logAuthzDeny({ resourceType: "session", reason: "unauthenticated" });
    return { ok: false, response: unauthorizedResponse() };
  }

  const row = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      id: true,
      authId: true,
      role: true,
      organizationMemberships: {
        where: { status: "ACTIVE" },
        select: { organizationId: true, orgRole: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!row?.authId) {
    logAuthzDeny({
      resourceType: "session",
      resourceId: user.id,
      reason: "prisma_user_missing",
    });
    return {
      ok: false,
      response: forbiddenResponse("Conta não encontrada."),
    };
  }

  if (row.organizationMemberships.length > 1) {
    console.warn("[authz] multiple_active_memberships", {
      userId: row.id,
      count: row.organizationMemberships.length,
    });
  }

  return {
    ok: true,
    context: buildAuthContext({
      userId: row.id,
      authId: row.authId,
      platformRole: row.role,
      activeMemberships: row.organizationMemberships,
    }),
  };
}

export function requireRole(
  context: AuthContext,
  allowed: readonly UserRole[],
  resourceType = "role"
): AuthResult {
  if (hasAllowedRole(context, allowed)) {
    return { ok: true, context };
  }

  logAuthzDeny({
    userId: context.userId,
    role: context.platformRole,
    orgRole: context.orgRole,
    resourceType,
    reason: "role_not_allowed",
  });
  return { ok: false, response: forbiddenResponse() };
}

export function requireBusinessOnboarding(context: AuthContext): AuthResult {
  if (canOnboardBusiness(context)) {
    return { ok: true, context };
  }

  logAuthzDeny({
    userId: context.userId,
    role: context.platformRole,
    orgRole: context.orgRole,
    resourceType: "org.onboarding",
    reason: "onboarding_not_allowed",
  });
  return { ok: false, response: forbiddenResponse() };
}

export function requireOrganizationAccess(
  context: AuthContext,
  organizationId: string | null | undefined,
  options: OrganizationAccessOptions = {}
): AuthResult {
  if (canAccessOrganization(context, organizationId, options)) {
    return { ok: true, context };
  }

  logAuthzDeny({
    userId: context.userId,
    role: context.platformRole,
    orgRole: context.orgRole,
    resourceType: "organization",
    resourceId: organizationId ?? null,
    reason: context.orgRole ? "organization_mismatch" : "membership_inactive",
  });
  return { ok: false, response: privateNotFoundResponse() };
}
