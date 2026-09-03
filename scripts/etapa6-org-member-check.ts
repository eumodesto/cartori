import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import {
  MembershipRemovedError,
  applyCreatorOnboardingTx,
  persistCreatorOnboarding,
  wouldViolateSingleOrg,
} from "../src/lib/org-membership";

function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

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

assert(!wouldViolateSingleOrg([], null), "empty user can create org");
assert(!wouldViolateSingleOrg(["org-a"], "org-a"), "same org is ok");
assert(wouldViolateSingleOrg(["org-a"], null), "second new org denied");
assert(wouldViolateSingleOrg(["org-a"], "org-b"), "other org denied");

const prisma = new PrismaClient();

function companyData(email: string) {
  return {
    name: "Etapa6 Empresa Sintetica",
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

async function main() {
  const suffix = `${Date.now()}`;
  const emailA = `etapa6.a.${suffix}@example.invalid`;
  const emailB = `etapa6.b.${suffix}@example.invalid`;
  const cnpjA = makeCnpj(Number(suffix.slice(-8)));
  const cnpjB = makeCnpj(Number(suffix.slice(-8)) + 31);
  const createdUserIds: string[] = [];
  const createdOrgIds: string[] = [];

  async function cleanup() {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    if (createdOrgIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    }
  }

  try {
    const userA = await prisma.user.create({
      data: { email: emailA, name: "Etapa6 A", role: "CLIENT" },
    });
    const userB = await prisma.user.create({
      data: { email: emailB, name: "Etapa6 B", role: "CLIENT" },
    });
    createdUserIds.push(userA.id, userB.id);

    const org = await persistCreatorOnboarding({
      userId: userA.id,
      cnpj: cnpjA,
      existingOrganizationId: null,
      companyData: companyData(emailA),
    });
    createdOrgIds.push(org.id);

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: userA.id, organizationId: org.id } },
    });
    const userAfter = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(org.plan === "STANDARD", "onboarding STANDARD");
    assert(member?.orgRole === "OWNER", "OWNER");
    assert(member?.status === "ACTIVE", "ACTIVE");
    assert(member?.removedAt == null, "removedAt null");
    assert(Boolean(member?.joinedAt), "joinedAt set");
    assert(userAfter?.role === "CLIENT", "platformRole stays CLIENT");

    await persistCreatorOnboarding({
      userId: userA.id,
      cnpj: cnpjA,
      existingOrganizationId: org.id,
      companyData: companyData(emailA),
    });
    assert((await prisma.organization.count({ where: { cnpj: cnpjA } })) === 1, "org idempotent");
    assert(
      (await prisma.organizationMember.count({ where: { userId: userA.id } })) === 1,
      "member idempotent"
    );

    const concurrentCnpj = makeCnpj(Number(suffix.slice(-8)) + 77);
    const userC = await prisma.user.create({
      data: { email: `etapa6.c.${suffix}@example.invalid`, name: "Etapa6 C", role: "CLIENT" },
    });
    createdUserIds.push(userC.id);
    const concurrent = await Promise.allSettled([
      persistCreatorOnboarding({
        userId: userC.id,
        cnpj: concurrentCnpj,
        existingOrganizationId: null,
        companyData: companyData(userC.email),
      }),
      persistCreatorOnboarding({
        userId: userC.id,
        cnpj: concurrentCnpj,
        existingOrganizationId: null,
        companyData: companyData(userC.email),
      }),
    ]);
    const concurrentOrg = await prisma.organization.findUnique({ where: { cnpj: concurrentCnpj } });
    if (concurrentOrg) createdOrgIds.push(concurrentOrg.id);
    const concurrentMembers = concurrentOrg
      ? await prisma.organizationMember.count({
          where: { userId: userC.id, organizationId: concurrentOrg.id },
        })
      : 0;
    const concurrentUser = await prisma.user.findUnique({ where: { id: userC.id } });
    assert(
      concurrent.some((item) => item.status === "fulfilled"),
      "concurrency has a success"
    );
    assert(Boolean(concurrentOrg), "concurrency created one org");
    assert(concurrentMembers === 1, "concurrency one membership");
    assert(concurrentUser?.role === "CLIENT", "concurrency platformRole stays CLIENT");

    const orgB = await prisma.organization.create({
      data: {
        name: "Etapa6 Org B",
        cnpj: cnpjB,
        phone: "nao-informado",
        email: emailB,
      },
    });
    createdOrgIds.push(orgB.id);
    assert(
      wouldViolateSingleOrg([org.id], orgB.id),
      "second org helper"
    );

    try {
      await prisma.$transaction(async (tx) => {
        await applyCreatorOnboardingTx(tx, {
          userId: userB.id,
          cnpj: makeCnpj(Number(suffix.slice(-8)) + 91),
          existingOrganizationId: null,
          companyData: companyData(emailB),
        });
        throw new Error("CARTORI_ATOMIC_PROBE_AFTER_ALL");
      });
      throw new Error("atomic probe should throw");
    } catch (error) {
      assert(
        error instanceof Error && error.message === "CARTORI_ATOMIC_PROBE_AFTER_ALL",
        "atomic probe thrown"
      );
    }
    assert(
      (await prisma.user.findUnique({ where: { id: userB.id } }))?.role === "CLIENT",
      "atomic rollback user"
    );
    assert(
      (await prisma.organizationMember.count({ where: { userId: userB.id } })) === 0,
      "atomic rollback member"
    );

    try {
      await prisma.$transaction(async (tx) => {
        const created = await tx.organization.create({
          data: {
            cnpj: makeCnpj(Number(suffix.slice(-8)) + 92),
            ...companyData(emailB),
          },
        });
        createdOrgIds.push(created.id);
        throw new Error("CARTORI_ATOMIC_PROBE_AFTER_ORG");
      });
    } catch (error) {
      assert(
        error instanceof Error && error.message === "CARTORI_ATOMIC_PROBE_AFTER_ORG",
        "after-org probe"
      );
    }

    const uniqueCnpj = makeCnpj(Number(suffix.slice(-8)) + 93);
    const uniqueOrg = await persistCreatorOnboarding({
      userId: userB.id,
      cnpj: uniqueCnpj,
      existingOrganizationId: null,
      companyData: companyData(emailB),
    });
    createdOrgIds.push(uniqueOrg.id);
    let uniqueDenied = false;
    try {
      await prisma.organizationMember.create({
        data: {
          userId: userB.id,
          organizationId: uniqueOrg.id,
          orgRole: "MEMBER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });
    } catch {
      uniqueDenied = true;
    }
    assert(uniqueDenied, "unique user+org");

    await prisma.organizationMember.update({
      where: { userId_organizationId: { userId: userB.id, organizationId: uniqueOrg.id } },
      data: { status: "REMOVED", removedAt: new Date() },
    });
    let removedDenied = false;
    try {
      await persistCreatorOnboarding({
        userId: userB.id,
        cnpj: uniqueCnpj,
        existingOrganizationId: uniqueOrg.id,
        companyData: companyData(emailB),
      });
    } catch (error) {
      removedDenied = error instanceof MembershipRemovedError;
    }
    const stillRemoved = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: userB.id, organizationId: uniqueOrg.id } },
    });
    assert(removedDenied, "REMOVED is not reactivated");
    assert(stillRemoved?.status === "REMOVED", "REMOVED remains");

    console.log("etapa6-org-member-check: PASS");
  } finally {
    await cleanup();
  }
}

main()
  .catch((error) => {
    console.error("etapa6-org-member-check failed", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
