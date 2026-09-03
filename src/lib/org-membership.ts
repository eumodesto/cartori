import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Membership helpers.
 *
 * OrganizationMember ACTIVE is the authorization source.
 */
export class MembershipRemovedError extends Error {
  constructor() {
    super("Membership removida não é reativada neste fluxo.");
    this.name = "MembershipRemovedError";
  }
}

export class MembershipInconsistentError extends Error {
  constructor() {
    super("Membership existente não é OWNER ACTIVE.");
    this.name = "MembershipInconsistentError";
  }
}

export class OrganizationCnpjTakenError extends Error {
  constructor() {
    super("Este CNPJ já está cadastrado em outra conta Cartori.");
    this.name = "OrganizationCnpjTakenError";
  }
}

export function isPrismaUniqueViolation(error: unknown, target?: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  if (!target) return true;
  const fields = error.meta?.target;
  if (Array.isArray(fields)) return fields.includes(target);
  if (typeof fields === "string") return fields.includes(target);
  return false;
}

export async function getActiveOrganizationMemberships(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrganizationMembership(userId: string, organizationId: string) {
  return prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

export function wouldViolateSingleOrg(
  activeMembershipOrgIds: string[],
  targetOrganizationId: string | null
) {
  const held = new Set(activeMembershipOrgIds.filter(Boolean));
  if (held.size === 0) return false;
  if (targetOrganizationId && held.size === 1 && held.has(targetOrganizationId)) {
    return false;
  }
  return true;
}

export async function ensureCreatorOwnerMembershipInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string
) {
  const existing = await tx.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });

  if (!existing) {
    await tx.organizationMember.create({
      data: {
        userId,
        organizationId,
        orgRole: OrganizationMemberRole.OWNER,
        status: OrganizationMemberStatus.ACTIVE,
        joinedAt: new Date(),
        removedAt: null,
      },
    });
    return;
  }

  if (existing.status === "REMOVED") {
    throw new MembershipRemovedError();
  }

  if (existing.status !== "ACTIVE" || existing.orgRole !== "OWNER") {
    throw new MembershipInconsistentError();
  }
}

type OrganizationWriteData = {
  name: string;
  tradeName: string | null;
  plan: "STANDARD" | "PARTNER";
  cnpjVerifiedAt: Date;
  cnpjStatus: string | null;
  legalNature: string | null;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  oabNumber: string | null;
  creciNumber: string | null;
};

export async function persistCreatorOnboarding(input: {
  userId: string;
  cnpj: string;
  existingOrganizationId: string | null;
  companyData: OrganizationWriteData;
}) {
  try {
    return await prisma.$transaction((tx) => applyCreatorOnboardingTx(tx, input));
  } catch (error) {
    if (!isPrismaUniqueViolation(error)) throw error;
    const found = await prisma.organization.findUnique({ where: { cnpj: input.cnpj } });
    if (!found) throw error;
    const membership = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: input.userId, organizationId: found.id } },
    });
    const owns = membership?.status === "ACTIVE" && membership.orgRole === "OWNER";
    if (!owns) throw new OrganizationCnpjTakenError();
    return prisma.$transaction((tx) =>
      applyCreatorOnboardingTx(tx, {
        ...input,
        existingOrganizationId: found.id,
      })
    );
  }
}

export async function applyCreatorOnboardingTx(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    cnpj: string;
    existingOrganizationId: string | null;
    companyData: OrganizationWriteData;
  }
) {
  const organization = input.existingOrganizationId
    ? await tx.organization.update({
        where: { id: input.existingOrganizationId },
        data: input.companyData,
      })
    : await tx.organization.create({
        data: {
          cnpj: input.cnpj,
          ...input.companyData,
        },
      });

  await ensureCreatorOwnerMembershipInTx(tx, input.userId, organization.id);

  return organization;
}
