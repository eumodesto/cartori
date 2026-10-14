import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  MembershipRemovedError,
  applyCreatorOnboardingTx,
  persistCreatorOnboarding,
} from "@/lib/org-membership";

function makeCnpj(seed: number) {
  const calc = (base: string, weights: number[]) => {
    const total = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const prefix = String(980000000000 + (seed % 8999999999)).padStart(12, "0").slice(0, 12);
  const d1 = calc(prefix, w1);
  const d2 = calc(prefix + String(d1), w2);
  return prefix + String(d1) + String(d2);
}

function companyData(email: string) {
  return {
    name: "Empresa Sintética de Teste",
    tradeName: null,
    plan: "STANDARD" as const,
    cnpjVerifiedAt: new Date(),
    cnpjStatus: "ATIVA",
    legalNature: null,
    phone: "nao-informado",
    email,
    address: null,
    city: null,
    state: null,
    cep: null,
    oabNumber: null,
    creciNumber: null,
  };
}

const suffix = `${Date.now()}`;
const seed = Number(suffix.slice(-8));
const createdUserIds: string[] = [];
const createdOrgIds: string[] = [];

async function createUser(label: string) {
  const user = await prisma.user.create({
    data: { email: `org.${label}.${suffix}@example.invalid`, name: `Teste ${label}`, role: "CLIENT" },
  });
  createdUserIds.push(user.id);
  return user;
}

afterAll(async () => {
  if (createdUserIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
  if (createdOrgIds.length) {
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
  }
  await prisma.$disconnect();
});

describe("persistCreatorOnboarding", () => {
  let userA: Awaited<ReturnType<typeof createUser>>;

  beforeAll(async () => {
    userA = await createUser("a");
  });

  it("cria org STANDARD com OWNER ACTIVE e mantém o usuário CLIENT", async () => {
    const org = await persistCreatorOnboarding({
      userId: userA.id,
      cnpj: makeCnpj(seed),
      existingOrganizationId: null,
      companyData: companyData(userA.email),
    });
    createdOrgIds.push(org.id);

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: userA.id, organizationId: org.id } },
    });
    const user = await prisma.user.findUnique({ where: { id: userA.id } });

    expect(org.plan).toBe("STANDARD");
    expect(member?.orgRole).toBe("OWNER");
    expect(member?.status).toBe("ACTIVE");
    expect(member?.removedAt).toBeNull();
    expect(member?.joinedAt).toBeInstanceOf(Date);
    expect(user?.role).toBe("CLIENT");
  });

  it("repetir o onboarding da mesma empresa é idempotente", async () => {
    const cnpj = makeCnpj(seed);
    const org = await prisma.organization.findUniqueOrThrow({ where: { cnpj } });
    await persistCreatorOnboarding({
      userId: userA.id,
      cnpj,
      existingOrganizationId: org.id,
      companyData: companyData(userA.email),
    });
    expect(await prisma.organization.count({ where: { cnpj } })).toBe(1);
    expect(await prisma.organizationMember.count({ where: { userId: userA.id } })).toBe(1);
  });

  it("duas chamadas simultâneas com o mesmo CNPJ geram uma org e uma membership", async () => {
    const userC = await createUser("c");
    const cnpj = makeCnpj(seed + 77);
    const input = {
      userId: userC.id,
      cnpj,
      existingOrganizationId: null,
      companyData: companyData(userC.email),
    };
    const results = await Promise.allSettled([
      persistCreatorOnboarding(input),
      persistCreatorOnboarding(input),
    ]);
    const org = await prisma.organization.findUnique({ where: { cnpj } });
    if (org) createdOrgIds.push(org.id);

    expect(results.some((item) => item.status === "fulfilled")).toBe(true);
    expect(org).not.toBeNull();
    expect(
      await prisma.organizationMember.count({ where: { userId: userC.id, organizationId: org!.id } })
    ).toBe(1);
    expect((await prisma.user.findUnique({ where: { id: userC.id } }))?.role).toBe("CLIENT");
  });

  it("falha dentro da transação desfaz org e membership", async () => {
    const userB = await createUser("b");
    const cnpj = makeCnpj(seed + 91);
    await expect(
      prisma.$transaction(async (tx) => {
        await applyCreatorOnboardingTx(tx, {
          userId: userB.id,
          cnpj,
          existingOrganizationId: null,
          companyData: companyData(userB.email),
        });
        throw new Error("ROLLBACK_PROBE");
      })
    ).rejects.toThrow("ROLLBACK_PROBE");

    expect(await prisma.organization.count({ where: { cnpj } })).toBe(0);
    expect(await prisma.organizationMember.count({ where: { userId: userB.id } })).toBe(0);
  });

  it("o banco impede duas memberships do mesmo usuário na mesma org", async () => {
    const userD = await createUser("d");
    const org = await persistCreatorOnboarding({
      userId: userD.id,
      cnpj: makeCnpj(seed + 93),
      existingOrganizationId: null,
      companyData: companyData(userD.email),
    });
    createdOrgIds.push(org.id);

    await expect(
      prisma.organizationMember.create({
        data: {
          userId: userD.id,
          organizationId: org.id,
          orgRole: "MEMBER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      })
    ).rejects.toThrow();
  });

  it("membership REMOVED não é reativada", async () => {
    const userE = await createUser("e");
    const cnpj = makeCnpj(seed + 95);
    const org = await persistCreatorOnboarding({
      userId: userE.id,
      cnpj,
      existingOrganizationId: null,
      companyData: companyData(userE.email),
    });
    createdOrgIds.push(org.id);
    await prisma.organizationMember.update({
      where: { userId_organizationId: { userId: userE.id, organizationId: org.id } },
      data: { status: "REMOVED", removedAt: new Date() },
    });

    await expect(
      persistCreatorOnboarding({
        userId: userE.id,
        cnpj,
        existingOrganizationId: org.id,
        companyData: companyData(userE.email),
      })
    ).rejects.toBeInstanceOf(MembershipRemovedError);

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: userE.id, organizationId: org.id } },
    });
    expect(member?.status).toBe("REMOVED");
  });
});
