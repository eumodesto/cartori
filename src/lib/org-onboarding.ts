import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { requireAuth, requireBusinessOnboarding } from "@/lib/authorization";
import { lookupCnpj } from "@/lib/cnpj";
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
  const cnpj = digitsOnly(String((body as { cnpj?: unknown }).cnpj || ""));
  const oabNumber = String((body as { oabNumber?: unknown }).oabNumber || "").trim() || null;
  const creciNumber =
    String((body as { creciNumber?: unknown }).creciNumber || "").trim() || null;

  if (!isValidCnpj(cnpj)) {
    return NextResponse.json({ success: false, error: "CNPJ inválido." }, { status: 400 });
  }

  const existing = await prisma.organization.findUnique({ where: { cnpj } });
  if (existing && existing.id !== auth.context.organizationId) {
    return NextResponse.json(
      { success: false, error: "Este CNPJ já está cadastrado em outra conta Cartori." },
      { status: 409 }
    );
  }

  const activeMemberships = await getActiveOrganizationMemberships(auth.context.userId);
  if (
    wouldViolateSingleOrg(
      activeMemberships.map((row) => row.organizationId),
      existing?.id ?? null
    )
  ) {
    return NextResponse.json(
      { success: false, error: "Esta conta já está vinculada a outra empresa." },
      { status: 409 }
    );
  }

  const company = await lookupCnpj(cnpj);
  if (!company) {
    return NextResponse.json(
      { success: false, error: "Não encontramos esse CNPJ na Receita Federal." },
      { status: 404 }
    );
  }
  if (!company.active) {
    return NextResponse.json(
      {
        success: false,
        error: `CNPJ com situação "${company.status}". Só empresas ativas podem ser cadastradas.`,
      },
      { status: 400 }
    );
  }

  const plan = planAfterBusinessOnboarding(existing?.plan);
  const companyData = {
    name: company.name,
    tradeName: company.tradeName,
    plan,
    cnpjVerifiedAt: new Date(),
    cnpjStatus: company.status,
    legalNature: company.legalNature,
    phone: company.phone || profile.phone || "nao-informado",
    email: company.email || profile.email,
    address: company.address,
    city: company.city,
    state: company.state,
    cep: company.cep,
    oabNumber,
    creciNumber,
  };

  try {
    await persistCreatorOnboarding({
      userId: auth.context.userId,
      cnpj,
      existingOrganizationId: existing?.id ?? null,
      companyData,
    });
  } catch (error) {
    if (error instanceof MembershipRemovedError) {
      return NextResponse.json(
        { success: false, error: "Esta empresa não pode ser reativada neste fluxo." },
        { status: 409 }
      );
    }
    if (error instanceof MembershipInconsistentError) {
      return NextResponse.json(
        { success: false, error: "Não foi possível vincular a empresa a esta conta." },
        { status: 409 }
      );
    }
    if (error instanceof OrganizationCnpjTakenError) {
      return NextResponse.json(
        { success: false, error: "Este CNPJ já está cadastrado em outra conta Cartori." },
        { status: 409 }
      );
    }
    throw error;
  }

  const updated = await getAuthProfile();
  return NextResponse.json({ success: true, profile: updated, company });
}
