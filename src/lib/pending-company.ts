import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { onboardBusiness } from "@/lib/org-onboarding";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

/**
 * Empresa informada no signup. Fica em user_metadata até o e-mail ser confirmado,
 * porque a Organization só nasce para um User Prisma já vinculado ao authId.
 * user_metadata é editável pelo próprio usuário: o dado só serve de entrada para
 * o mesmo onboarding de POST /api/org, que revalida CNPJ e regras de tenant.
 */
export type PendingCompany = {
  cnpj: string;
  oabNumber: string | null;
  creciNumber: string | null;
};

export const PENDING_COMPANY_KEY = "pending_company";

export function readPendingCompany(metadata: Record<string, unknown> | undefined): PendingCompany | null {
  const raw = metadata?.[PENDING_COMPANY_KEY];
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const cnpj = typeof value.cnpj === "string" ? value.cnpj : "";
  if (!isValidCnpj(cnpj)) return null;
  const text = (field: unknown) => (typeof field === "string" && field.trim() ? field.trim() : null);
  return { cnpj, oabNumber: text(value.oabNumber), creciNumber: text(value.creciNumber) };
}

/** Roda depois de syncAuthUser. Nunca bloqueia a sessão: falhas ficam para o painel. */
export async function completePendingCompany(
  supabase: SupabaseClient,
  authUser: SupabaseUser
): Promise<void> {
  const pending = readPendingCompany(authUser.user_metadata);
  if (!pending) return;

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
    select: {
      id: true,
      role: true,
      email: true,
      phone: true,
      organizationMemberships: { where: { status: "ACTIVE" }, select: { id: true } },
    },
  });
  if (!user) return;

  const clear = () => supabase.auth.updateUser({ data: { [PENDING_COMPANY_KEY]: null } });

  if (user.role !== "CLIENT" || user.organizationMemberships.length > 0) {
    await clear();
    return;
  }

  try {
    const result = await onboardBusiness({
      userId: user.id,
      currentOrganizationId: null,
      cnpj: pending.cnpj,
      oabNumber: pending.oabNumber,
      creciNumber: pending.creciNumber,
      fallbackPhone:
        user.phone ||
        (typeof authUser.user_metadata?.phone === "string"
          ? digitsOnly(authUser.user_metadata.phone) || null
          : null),
      fallbackEmail: user.email,
    });
    if (!result.ok) {
      console.warn("[auth] pending_company_rejected", { userId: user.id, status: result.status });
    }
    await clear();
  } catch (error) {
    console.warn("[auth] pending_company_retry_later", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
