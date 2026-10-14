-- Índice do dono do pedido e FK de revenda (sellerOrgId órfão vira NULL).
-- EmailTemplate e AppSetting nasceram sem RLS; fecha a Data API no mesmo padrão deny-all.

UPDATE "Order"
SET "sellerOrgId" = NULL
WHERE "sellerOrgId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Organization" AS org WHERE org."id" = "Order"."sellerOrgId"
  );

CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_organizationId_idx" ON "Order"("organizationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_sellerOrgId_fkey'
  ) THEN
    ALTER TABLE "Order"
      ADD CONSTRAINT "Order_sellerOrgId_fkey"
      FOREIGN KEY ("sellerOrgId") REFERENCES "Organization"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

REVOKE ALL ON TABLE "EmailTemplate" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE "AppSetting" FROM anon, authenticated, PUBLIC;
ALTER TABLE "EmailTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppSetting" ENABLE ROW LEVEL SECURITY;
