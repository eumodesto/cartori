-- AlterEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('STANDARD', 'PARTNER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "authId" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "plan" "OrganizationPlan" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "Organization" ADD COLUMN "cnpjVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "cnpjStatus" TEXT;
ALTER TABLE "Organization" ADD COLUMN "legalNature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");
