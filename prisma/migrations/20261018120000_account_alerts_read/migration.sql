-- Caixa de alertas: lido salvo no servidor (vale em qualquer navegador ou aparelho).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "alertsSeenAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "AlertRead" (
  "userId" TEXT NOT NULL,
  "alertId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AlertRead_pkey" PRIMARY KEY ("userId", "alertId")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AlertRead_userId_fkey') THEN
    ALTER TABLE "AlertRead"
      ADD CONSTRAINT "AlertRead_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Mesmo padrão das demais tabelas: Data API do Supabase fechada (deny-all).
REVOKE ALL ON TABLE "AlertRead" FROM anon, authenticated, PUBLIC;
ALTER TABLE "AlertRead" ENABLE ROW LEVEL SECURITY;
