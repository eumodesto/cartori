import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { requireAuth, requireRole } from "@/lib/authorization";
import { lookupCnpj } from "@/lib/cnpj";
import { planAfterBusinessOnboarding } from "@/lib/org-plan";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

/**
 * Business onboarding (Etapa 5).
 *
 * CLIENT/B2B_ADMIN may register a CNPJ and become B2B_ADMIN of that Organization.
 * That is tenant administration, not Cartori ADMIN and not the Partner program.
 *
 * This flow never grants PARTNER from the browser or from CNPJ signup.
 * An existing PARTNER org is not downgraded.
 *
 * TBD — PARTNER ACTIVATION POLICY
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

  const allowed = requireRole(auth.context, ["CLIENT", "B2B_ADMIN"], "org.onboarding");
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

  const organization = existing
    ? await prisma.organization.update({
        where: { id: existing.id },
        data: companyData,
      })
    : await prisma.organization.create({
        data: {
          cnpj,
          ...companyData,
        },
      });

  await prisma.user.update({
    where: { id: auth.context.userId },
    data: {
      organizationId: organization.id,
      role: "B2B_ADMIN",
    },
  });

  const updated = await getAuthProfile();
  return NextResponse.json({ success: true, profile: updated, company });
}
