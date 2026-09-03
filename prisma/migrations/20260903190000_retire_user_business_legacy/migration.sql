-- Etapa 6C: remove User.organizationId and B2B_* platform roles.
-- Order.organizationId, OrganizationMember, Partner/plan are untouched.
-- Destructive only for the approved legacy User business fields/enum values.

-- Abort if any legacy business User lacks an ACTIVE membership (same org when FK is set).
DO $$
DECLARE
  missing integer;
BEGIN
  SELECT COUNT(*) INTO missing
  FROM "User" u
  WHERE (
    u."role" IN ('B2B_ADMIN', 'B2B_MEMBER')
    OR u."organizationId" IS NOT NULL
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "OrganizationMember" m
    WHERE m."userId" = u."id"
      AND m."status" = 'ACTIVE'
      AND (
        u."organizationId" IS NULL
        OR m."organizationId" = u."organizationId"
      )
  );

  IF missing > 0 THEN
    RAISE EXCEPTION
      'Etapa 6C abort: % user(s) with legacy business fields lack ACTIVE membership',
      missing;
  END IF;
END $$;

-- Platform role after this wave is CLIENT | OPERATOR | ADMIN.
UPDATE "User"
SET "role" = 'CLIENT'
WHERE "role" IN ('B2B_ADMIN', 'B2B_MEMBER');

ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";
ALTER TABLE "User" DROP COLUMN "organizationId";

CREATE TYPE "UserRole_new" AS ENUM ('CLIENT', 'ADMIN', 'OPERATOR');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING ("role"::text::"UserRole_new");
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT'::"UserRole";
