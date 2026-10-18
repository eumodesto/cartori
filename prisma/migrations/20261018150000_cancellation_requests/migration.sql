-- Pedidos de cancelamento/estorno feitos pelo cliente, confirmados pela equipe.
CREATE TABLE IF NOT EXISTS "CancellationRequest" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "requestedById" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reason" TEXT NOT NULL,
  "orderTotal" DECIMAL(10,2) NOT NULL,
  "feeAmount" DECIMAL(10,2) NOT NULL,
  "refundAmount" DECIMAL(10,2) NOT NULL,
  "resolvedById" TEXT,
  "resolutionNote" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CancellationRequest_orderId_createdAt_idx" ON "CancellationRequest"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "CancellationRequest_status_createdAt_idx" ON "CancellationRequest"("status", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CancellationRequest_orderId_fkey') THEN
    ALTER TABLE "CancellationRequest"
      ADD CONSTRAINT "CancellationRequest_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Só um pedido em análise por vez para cada pedido.
CREATE UNIQUE INDEX IF NOT EXISTS "CancellationRequest_one_pending_per_order"
  ON "CancellationRequest"("orderId") WHERE "status" = 'PENDING';

REVOKE ALL ON TABLE "CancellationRequest" FROM anon, authenticated, PUBLIC;
ALTER TABLE "CancellationRequest" ENABLE ROW LEVEL SECURITY;
