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
    users,
    usersWithOrg,
    b2bAdmin,
    b2bMember,
    clientWithOrg,
    internalWithOrg,
    b2bWithoutOrg,
    members,
    active,
    removed,
    owners,
    admins,
    memberRole,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.user.count({ where: { organizationId: { not: null } } }),
    prisma.user.count({ where: { role: "B2B_ADMIN" } }),
    prisma.user.count({ where: { role: "B2B_MEMBER" } }),
    prisma.user.count({ where: { role: "CLIENT", organizationId: { not: null } } }),
    prisma.user.count({
      where: { role: { in: ["ADMIN", "OPERATOR"] }, organizationId: { not: null } },
    }),
    prisma.user.count({
      where: { role: { in: ["B2B_ADMIN", "B2B_MEMBER"] }, organizationId: null },
    }),
    prisma.organizationMember.count(),
    prisma.organizationMember.count({ where: { status: "ACTIVE" } }),
    prisma.organizationMember.count({ where: { status: "REMOVED" } }),
    prisma.organizationMember.count({ where: { orgRole: "OWNER" } }),
    prisma.organizationMember.count({ where: { orgRole: "ADMIN" } }),
    prisma.organizationMember.count({ where: { orgRole: "MEMBER" } }),
  ]);

  console.log(
    JSON.stringify(
      {
        organizations,
        users,
        usersWithOrg,
        b2bAdmin,
        b2bMember,
        inconsistencies: { clientWithOrg, internalWithOrg, b2bWithoutOrg },
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
