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
    const key = trimmed.slice(eq + 1).trim();
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
    users,
    members,
    active,
    removed,
    owners,
    admins,
    memberRole,
    ordersWithOrg,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.organizationMember.count(),
    prisma.organizationMember.count({ where: { status: "ACTIVE" } }),
    prisma.organizationMember.count({ where: { status: "REMOVED" } }),
    prisma.organizationMember.count({ where: { orgRole: "OWNER" } }),
    prisma.organizationMember.count({ where: { orgRole: "ADMIN" } }),
    prisma.organizationMember.count({ where: { orgRole: "MEMBER" } }),
    prisma.order.count({ where: { organizationId: { not: null } } }),
  ]);

  console.log(
    JSON.stringify(
      {
        organizations,
        users,
        ordersWithOrg,
        memberships: {
          total: members,
          ACTIVE: active,
          REMOVED: removed,
          OWNER: owners,
          ADMIN: admins,
          MEMBER: memberRole,
        },
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
