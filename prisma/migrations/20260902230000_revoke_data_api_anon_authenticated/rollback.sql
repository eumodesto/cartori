-- Rollback fiel da migration 20260902230000_revoke_data_api_anon_authenticated.
-- Restaura exatamente os privilégios observados em 2026-09-03T01:30:43Z.
-- Não executar via prisma migrate; aplicar manualmente se precisar reabrir a Data API.
--
-- Estado anterior por tabela (relacl PG17): arwdDxtm
--   a INSERT, r SELECT, w UPDATE, d DELETE, D TRUNCATE, x REFERENCES,
--   t TRIGGER, m MAINTAIN
-- information_schema não lista MAINTAIN; o ACL prova que ele existia.
-- GRANT ALL seria equivalente hoje, mas listamos as letras do ACL para
-- não incluir privilégios futuros.

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON TABLE
  "User",
  "Organization",
  "Order",
  "OrderItem",
  "Payment",
  "Cartorio",
  "Product",
  "ProductField",
  "ProductPrice",
  "_prisma_migrations"
TO anon, authenticated;

-- Defaults FOR ROLE postgres IN SCHEMA public (estado anterior).
-- Sequences: rwU = SELECT, UPDATE, USAGE. Functions: X = EXECUTE.
-- Não havia sequences nem functions no public; os defaults existiam mesmo assim.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, UPDATE, USAGE ON SEQUENCES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
