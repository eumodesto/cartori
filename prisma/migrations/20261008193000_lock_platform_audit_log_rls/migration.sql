-- Tabela legada presente no banco e ausente do schema atual.
-- Fecha a Data API: revoke + RLS deny-all, sem policy.

REVOKE ALL ON TABLE "PlatformAuditLog" FROM anon, authenticated, PUBLIC;
ALTER TABLE "PlatformAuditLog" ENABLE ROW LEVEL SECURITY;
