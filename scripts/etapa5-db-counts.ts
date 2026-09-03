import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

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

const prisma = new PrismaClient();

async function main() {
  const [
    organizations,
    byPlan,
    roles,
    usersWithOrg,
    ordersWithOrg,
    ordersWithSeller,
    resell,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.organizationMember.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { organizationId: { not: null } } }),
    prisma.order.count({ where: { sellerOrgId: { not: null } } }),
    prisma.order.count({ where: { kind: "RESELL" } }),
  ]);
  console.log(
    JSON.stringify(
      {
        organizations,
        byPlan: byPlan.map((row) => ({ plan: row.plan, count: row._count._all })),
        roles: roles.map((row) => ({ role: row.role, count: row._count._all })),
        usersWithActiveMembership: usersWithOrg,
        ordersWithOrg,
        ordersWithSeller,
        resell,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
