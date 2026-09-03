-- Interior placeholders and unknown IDs are not rows in Cartorio.
-- Keep cartorioName; drop the orphan id so the FK can be added.
UPDATE "OrderItem"
SET "cartorioId" = NULL
WHERE "cartorioId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Cartorio" AS "c" WHERE "c"."id" = "OrderItem"."cartorioId"
  );

-- AlterTable
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_cartorioId_fkey" FOREIGN KEY ("cartorioId") REFERENCES "Cartorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "OrderItem_cartorioId_idx" ON "OrderItem"("cartorioId");
