import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  type AuthContext,
  type OrganizationAccessOptions,
  canAccessOrganization,
  hasAllowedRole,
} from "@/lib/authorization-policy";

export {
  INTERNAL_ROLES,
  TENANT_ROLES,
  canAccessOrganization,
  canAccessOwnedOrder,
  hasAllowedRole,
  isInternalRole,
  isTenantRole,
  orderOwnerFromContext,
  type AuthContext,
  type InternalRole,
  type OrganizationAccessOptions,
  type TenantRole,
} from "@/lib/authorization-policy";

/**
 * Authorization foundation (Etapa 4).
 *
 * Identity comes only from the Supabase session + Prisma User row (authId).
 * Role and organizationId always come from the database, never from the browser.
 *
 * Limitation (intentional): tenant membership is User.organizationId only.
 * OrganizationMember (invites, multi-org, orgRole) is NOT implemented in this etapa.
 *
 * Fail-closed: unknown capability → deny. OPERATOR does not inherit ADMIN bypass.
 */
export type AuthOk = { ok: true; context: AuthContext };
export type AuthDenied = { ok: false; response: NextResponse };
export type AuthResult = AuthOk | AuthDenied;

export function logAuthzDeny(info: {
  userId?: string | null;
  role?: UserRole | string | null;
  resourceType: string;
  resourceId?: string | null;
  reason: string;
}) {
  console.warn("[authz] deny", {
    userId: info.userId ?? null,
    role: info.role ?? null,
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
      organizationId: true,
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

  return {
    ok: true,
    context: {
      userId: row.id,
      authId: row.authId,
      role: row.role,
      organizationId: row.organizationId,
    },
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
    role: context.role,
    resourceType,
    reason: "role_not_allowed",
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
    role: context.role,
    resourceType: "organization",
    resourceId: organizationId ?? null,
    reason: "organization_mismatch",
  });
  return { ok: false, response: privateNotFoundResponse() };
}
