import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthProfile } from "@/lib/auth-types";
import { digitsOnly } from "@/lib/utils";
import { OrganizationPlan, UserRole } from "@prisma/client";

function toProfile(user: {
  id: string;
  authId: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  organization: {
    id: string;
    name: string;
    tradeName: string | null;
    cnpj: string;
    plan: OrganizationPlan;
    cnpjVerifiedAt: Date | null;
    cnpjStatus: string | null;
    city: string | null;
    state: string | null;
  } | null;
}): AuthProfile {
  return {
    id: user.id,
    authId: user.authId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    cpf: user.cpf,
    role: user.role,
    organization: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
          tradeName: user.organization.tradeName,
          cnpj: user.organization.cnpj,
          plan: user.organization.plan,
          cnpjVerifiedAt: user.organization.cnpjVerifiedAt?.toISOString() || null,
          cnpjStatus: user.organization.cnpjStatus,
          city: user.organization.city,
          state: user.organization.state,
        }
      : null,
  };
}

const userInclude = {
  organization: true,
} as const;

export async function getAuthProfile(): Promise<AuthProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const row = await prisma.user.findFirst({
    where: {
      OR: [{ authId: user.id }, { email: user.email.toLowerCase() }],
    },
    include: userInclude,
  });
  if (!row) return null;

  if (!row.authId) {
    const linked = await prisma.user.update({
      where: { id: row.id },
      data: { authId: user.id },
      include: userInclude,
    });
    return toProfile(linked);
  }

  return toProfile(row);
}

export async function syncAuthUser(input: {
  authId: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
  role?: UserRole;
}): Promise<AuthProfile> {
  const email = input.email.trim().toLowerCase();
  const cpf = input.cpf ? digitsOnly(input.cpf) : undefined;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { authId: input.authId },
        { email },
        ...(cpf ? [{ cpf }] : []),
      ],
    },
    include: userInclude,
  });

  const row = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          authId: input.authId,
          email,
          name: input.name?.trim() || existing.name,
          phone: input.phone ? digitsOnly(input.phone) : existing.phone,
          cpf: cpf || existing.cpf,
          role: input.role || existing.role,
        },
        include: userInclude,
      })
    : await prisma.user.create({
        data: {
          authId: input.authId,
          email,
          name: input.name?.trim() || null,
          phone: input.phone ? digitsOnly(input.phone) : null,
          cpf: cpf || null,
          role: input.role || "CLIENT",
        },
        include: userInclude,
      });

  await prisma.order.updateMany({
    where: { userId: null, customerEmail: email },
    data: {
      userId: row.id,
      organizationId: row.organizationId,
    },
  });

  return toProfile(row);
}
