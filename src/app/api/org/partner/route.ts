import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { lookupCnpj } from "@/lib/cnpj";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile();
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Entre na sua conta para cadastrar a empresa." },
      { status: 401 }
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
  if (existing && existing.id !== profile.organization?.id) {
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
    where: { id: profile.id },
    data: {
      organizationId: organization.id,
      role: "B2B_ADMIN",
    },
  });

  await prisma.order.updateMany({
    where: { userId: profile.id },
    data: { organizationId: organization.id, isCompany: true, companyName: company.name },
  });

  const updated = await getAuthProfile();
  return NextResponse.json({ success: true, profile: updated, company });
}
