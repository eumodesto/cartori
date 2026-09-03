import { Prisma, OrganizationPlan, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AuthProfile } from "@/lib/auth-types";
import { digitsOnly } from "@/lib/utils";
import { normalizeCpf } from "@/lib/validators";

type ProfileOrganization = {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  plan: OrganizationPlan;
  cnpjVerifiedAt: Date | null;
  cnpjStatus: string | null;
  city: string | null;
  state: string | null;
};

function toAuthOrganization(organization: ProfileOrganization) {
  return {
    id: organization.id,
    name: organization.name,
    tradeName: organization.tradeName,
    cnpj: organization.cnpj,
    plan: organization.plan,
    cnpjVerifiedAt: organization.cnpjVerifiedAt?.toISOString() || null,
    cnpjStatus: organization.cnpjStatus,
    city: organization.city,
    state: organization.state,
  };
}

function toProfile(user: {
  id: string;
  authId: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  organizationMemberships: Array<{ organization: ProfileOrganization }>;
}): AuthProfile {
  const organization = user.organizationMemberships[0]?.organization ?? null;
  return {
    id: user.id,
    authId: user.authId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    cpf: user.cpf,
    role: user.role,
    organization: organization ? toAuthOrganization(organization) : null,
  };
}

const userInclude = {
  organizationMemberships: {
    where: { status: "ACTIVE" as const },
    include: { organization: true },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export class IdentityConflictError extends Error {
  status = 409 as const;
  constructor(
    message = "Já existe uma conta associada a este CPF.",
    readonly reason: "cpf" | "email" | "auth" = "cpf"
  ) {
    super(message);
    this.name = "IdentityConflictError";
  }
}

function uniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return field === "cpf";
}

function logIdentityConflict(
  reason: string,
  extra: Record<string, string | undefined>
) {
  console.warn("[auth] identity_conflict", { reason, ...extra });
}

export async function getAuthProfile(): Promise<AuthProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const row = await prisma.user.findUnique({
    where: { authId: user.id },
    include: userInclude,
  });
  return row ? toProfile(row) : null;
}

export async function syncAuthUser(input: {
  authId: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
}): Promise<AuthProfile> {
  const email = input.email.trim().toLowerCase();
  const cpf = normalizeCpf(input.cpf);
  const phone = input.phone ? digitsOnly(input.phone) : undefined;
  const name = input.name?.trim() || undefined;

  const byAuth = await prisma.user.findUnique({
    where: { authId: input.authId },
    include: userInclude,
  });

  if (byAuth) {
    if (cpf && byAuth.cpf && byAuth.cpf !== cpf) {
      const cpfOwner = await prisma.user.findUnique({ where: { cpf } });
      if (cpfOwner && cpfOwner.id !== byAuth.id) {
        logIdentityConflict("cpf_taken", { userId: byAuth.id });
        throw new IdentityConflictError();
      }
    }

    if (email !== byAuth.email) {
      const emailOwner = await prisma.user.findUnique({ where: { email } });
      if (emailOwner && emailOwner.id !== byAuth.id) {
        logIdentityConflict("email_taken", { userId: byAuth.id });
        throw new IdentityConflictError(
          "Não foi possível sincronizar esta conta.",
          "email"
        );
      }
    }

    try {
      const row = await prisma.user.update({
        where: { id: byAuth.id },
        data: {
          email,
          name: name || byAuth.name,
          phone: phone || byAuth.phone,
          cpf: byAuth.cpf || cpf || null,
        },
        include: userInclude,
      });
      return toProfile(row);
    } catch (error) {
      if (uniqueViolation(error, "cpf")) {
        logIdentityConflict("cpf_unique", { userId: byAuth.id });
        throw new IdentityConflictError();
      }
      if (uniqueViolation(error, "email")) {
        logIdentityConflict("email_unique", { userId: byAuth.id });
        throw new IdentityConflictError(
          "Não foi possível sincronizar esta conta.",
          "email"
        );
      }
      throw error;
    }
  }

  if (cpf) {
    const cpfOwner = await prisma.user.findUnique({ where: { cpf } });
    if (cpfOwner) {
      logIdentityConflict("cpf_taken", {});
      throw new IdentityConflictError();
    }
  }

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner) {
    logIdentityConflict("email_taken", {});
    throw new IdentityConflictError(
      "Não foi possível sincronizar esta conta.",
      "email"
    );
  }

  try {
    const row = await prisma.user.create({
      data: {
        authId: input.authId,
        email,
        name: name || null,
        phone: phone || null,
        cpf: cpf || null,
        role: "CLIENT",
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
  } catch (error) {
    if (uniqueViolation(error, "cpf")) {
      logIdentityConflict("cpf_unique", {});
      throw new IdentityConflictError();
    }
    if (uniqueViolation(error, "email") || uniqueViolation(error, "authId")) {
      logIdentityConflict("identity_unique", {});
      throw new IdentityConflictError(
        "Não foi possível sincronizar esta conta.",
        "auth"
      );
    }
    throw error;
  }
}
