-- Etapa 0: fechar Data API / PostgREST para objetos gerenciados pelo Prisma.
--
-- Inventário (2026-09-03T01:30:43Z, Postgres 17.6):
--   current_user / owner das tabelas: postgres (rolbypassrls = true)
--   schema public: 10 tabelas, 0 sequences, 0 functions
--   nenhum outro grantee além de postgres, anon, authenticated, service_role
--   relacl de cada tabela:
--     postgres=arwdDxtm/postgres
--     anon=arwdDxtm/postgres
--     authenticated=arwdDxtm/postgres
--     service_role=arwdDxtm/postgres
--   information_schema lista SELECT, INSERT, UPDATE, DELETE, TRUNCATE,
--   REFERENCES, TRIGGER. A letra m = MAINTAIN (PG17) também está no ACL.
--
-- Role criadora das migrations Prisma: postgres.
-- Default privileges FOR ROLE postgres IN SCHEMA public (antes):
--   TABLES    {postgres=arwdDxtm, anon=arwdDxtm, authenticated=arwdDxtm, service_role=arwdDxtm}
--   SEQUENCES {postgres=rwU,      anon=rwU,      authenticated=rwU,      service_role=rwU}
--   FUNCTIONS {postgres=X,        anon=X,        authenticated=X,        service_role=X}
--
-- Não altera: service_role, USAGE no schema public, schemas auth/storage,
-- defaults de supabase_admin, RLS.
-- Rollback fiel: ver rollback.sql neste diretório.

REVOKE ALL ON TABLE
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
FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
