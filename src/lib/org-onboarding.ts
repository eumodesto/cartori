import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { requireAuth, requireBusinessOnboarding } from "@/lib/authorization";
import { lookupCnpj, type CnpjCompany } from "@/lib/cnpj";
import {
  MembershipInconsistentError,
  MembershipRemovedError,
  OrganizationCnpjTakenError,
  getActiveOrganizationMemberships,
  persistCreatorOnboarding,
  wouldViolateSingleOrg,
} from "@/lib/org-membership";
import { planAfterBusinessOnboarding } from "@/lib/org-plan";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

/**
 * Business onboarding.
 *
 * CLIENT without ACTIVE membership, or OWNER/ADMIN ACTIVE of the same org,
 * may register/update a CNPJ. Creates Organization STANDARD + OWNER ACTIVE.
 * User.role stays CLIENT.
 *
 * This flow never grants PARTNER. TBD — PARTNER ACTIVATION POLICY
 */
export { planAfterBusinessOnboarding } from "@/lib/org-plan";

const CNPJ_TAKEN = "Este CNPJ já está cadastrado em outra conta Cartori.";

export async function postBusinessOnboarding(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na sua conta para cadastrar a empresa." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const allowed = requireBusinessOnboarding(auth.context);
  if (!allowed.ok) return allowed.response;

  const profile = await getAuthProfile();
  if (!profile || profile.id !== auth.context.userId) {
    return NextResponse.json(
      { success: false, error: "Conta não encontrada." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const result = await onboardBusiness({
    userId: auth.context.userId,
    currentOrganizationId: auth.context.organizationId,
    cnpj: String((body as { cnpj?: unknown }).cnpj || ""),
    oabNumber: String((body as { oabNumber?: unknown }).oabNumber || "").trim() || null,
    creciNumber: String((body as { creciNumber?: unknown }).creciNumber || "").trim() || null,
    fallbackPhone: profile.phone,
    fallbackEmail: profile.email,
  });
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }

  const updated = await getAuthProfile();
  return NextResponse.json({ success: true, profile: updated, company: result.company });
}

export type BusinessOnboardingResult =
  | { ok: true; company: CnpjCompany }
  | { ok: false; status: number; error: string };

/**
 * Creates/updates the Organization and the OWNER ACTIVE membership.
 * Callers must already have checked canOnboardBusiness for this user.
 */
export async function onboardBusiness(input: {
  userId: string;
  currentOrganizationId: string | null;
  cnpj: string;
  oabNumber: string | null;
  creciNumber: string | null;
  fallbackPhone?: string | null;
  fallbackEmail: string;
}): Promise<BusinessOnboardingResult> {
  const cnpj = digitsOnly(input.cnpj);
  if (!isValidCnpj(cnpj)) {
    return { ok: false, status: 400, error: "CNPJ inválido." };
  }

  const existing = await prisma.organization.findUnique({ where: { cnpj } });
  if (existing && existing.id !== input.currentOrganizationId) {
    return { ok: false, status: 409, error: CNPJ_TAKEN };
  }

  const activeMemberships = await getActiveOrganizationMemberships(input.userId);
  if (
    wouldViolateSingleOrg(
      activeMemberships.map((row) => row.organizationId),
      existing?.id ?? null
    )
  ) {
    return { ok: false, status: 409, error: "Esta conta já está vinculada a outra empresa." };
  }

  const company = await lookupCnpj(cnpj);
  if (!company) {
    return { ok: false, status: 404, error: "Não encontramos esse CNPJ na Receita Federal." };
  }
  if (!company.active) {
    return {
      ok: false,
      status: 400,
      error: `CNPJ com situação "${company.status}". Só empresas ativas podem ser cadastradas.`,
    };
  }

  const plan = planAfterBusinessOnboarding(existing?.plan);
  const companyData = {
    name: company.name,
    tradeName: company.tradeName,
    plan,
    cnpjVerifiedAt: new Date(),
    cnpjStatus: company.status,
    legalNature: company.legalNature,
    phone: company.phone || input.fallbackPhone || "nao-informado",
    email: company.email || input.fallbackEmail,
    address: company.address,
    city: company.city,
    state: company.state,
    cep: company.cep,
    oabNumber: input.oabNumber,
    creciNumber: input.creciNumber,
  };

  try {
    await persistCreatorOnboarding({
      userId: input.userId,
      cnpj,
      existingOrganizationId: existing?.id ?? null,
      companyData,
    });
  } catch (error) {
    if (error instanceof MembershipRemovedError) {
      return { ok: false, status: 409, error: "Esta empresa não pode ser reativada neste fluxo." };
    }
    if (error instanceof MembershipInconsistentError) {
      return { ok: false, status: 409, error: "Não foi possível vincular a empresa a esta conta." };
    }
    if (error instanceof OrganizationCnpjTakenError) {
      return { ok: false, status: 409, error: CNPJ_TAKEN };
    }
    throw error;
  }

  return { ok: true, company };
}
