-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgRole" "OrganizationMemberRole" NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_status_idx" ON "OrganizationMember"("organizationId", "status");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_status_idx" ON "OrganizationMember"("userId", "status");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill idempotent (ON CONFLICT DO NOTHING).
-- B2B_ADMIN + organizationId → OWNER ACTIVE
INSERT INTO "OrganizationMember" (
    "id",
    "organizationId",
    "userId",
    "orgRole",
    "status",
    "joinedAt",
    "removedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    u."organizationId",
    u."id",
    'OWNER'::"OrganizationMemberRole",
    'ACTIVE'::"OrganizationMemberStatus",
    u."createdAt",
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE u."role" = 'B2B_ADMIN'
  AND u."organizationId" IS NOT NULL
ON CONFLICT ("userId", "organizationId") DO NOTHING;

-- B2B_MEMBER + organizationId → MEMBER ACTIVE
INSERT INTO "OrganizationMember" (
    "id",
    "organizationId",
    "userId",
    "orgRole",
    "status",
    "joinedAt",
    "removedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    u."organizationId",
    u."id",
    'MEMBER'::"OrganizationMemberRole",
    'ACTIVE'::"OrganizationMemberStatus",
    u."createdAt",
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE u."role" = 'B2B_MEMBER'
  AND u."organizationId" IS NOT NULL
ON CONFLICT ("userId", "organizationId") DO NOTHING;
