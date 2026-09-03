import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { requireAuth, requireRole } from "@/lib/authorization";
import { lookupCnpj } from "@/lib/cnpj";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

/**
 * Partner onboarding (existing UI: PartnerPlanDialog).
 *
 * DECISÃO NECESSÁRIA: this route still lets a CLIENT create/attach an Organization
 * and become B2B_ADMIN. That is the current product flow, not a new commercial rule.
 * It does not grant Cartori ADMIN/OPERATOR, other tenants, or org-wide order listing.
 *
 * Body fields role, userId, organizationId, sellerOrgId are ignored.
 * INTERNAL roles and B2B_MEMBER cannot use this route (fail-closed).
 */
export async function POST(req: NextRequest) {
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

  const allowed = requireRole(auth.context, ["CLIENT", "B2B_ADMIN"], "org.partner");
  if (!allowed.ok) return allowed.response;

  const profile = await getAuthProfile();
  if (!profile || profile.id !== auth.context.userId) {
    return NextResponse.json(
      { success: false, error: "Conta não encontrada." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const cnpj = digitsOnly(String(body.cnpj || ""));
  const oabNumber = String(body.oabNumber || "").trim() || null;
  const creciNumber = String(body.creciNumber || "").trim() || null;

  if (!isValidCnpj(cnpj)) {
    return NextResponse.json({ success: false, error: "CNPJ inválido." }, { status: 400 });
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
        error: `CNPJ com situação "${company.status}". Só empresas ativas entram no plano parceiro.`,
      },
      { status: 400 }
    );
  }

  const existing = await prisma.organization.findUnique({ where: { cnpj } });
  if (existing && existing.id !== auth.context.organizationId) {
    return NextResponse.json(
      { success: false, error: "Este CNPJ já está cadastrado em outra conta Cartori." },
      { status: 409 }
    );
  }

  const organization = existing
    ? await prisma.organization.update({
        where: { id: existing.id },
        data: {
          name: company.name,
          tradeName: company.tradeName,
          plan: "PARTNER",
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
        },
      })
    : await prisma.organization.create({
        data: {
          name: company.name,
          tradeName: company.tradeName,
          cnpj,
          plan: "PARTNER",
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
        },
      });

  await prisma.user.update({
    where: { id: auth.context.userId },
    data: {
      organizationId: organization.id,
      role: "B2B_ADMIN",
    },
  });

  await prisma.order.updateMany({
    where: { userId: auth.context.userId },
    data: { organizationId: organization.id, isCompany: true, companyName: company.name },
  });

  const updated = await getAuthProfile();
  return NextResponse.json({ success: true, profile: updated, company });
}
