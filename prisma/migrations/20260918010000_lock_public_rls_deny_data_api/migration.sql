-- Fechar Data API / PostgREST no schema public (defesa em profundidade).
--
-- Arquitetura Cartori:
--   Identidade  = Supabase Auth (JWT) → User.authId
--   Dados       = Prisma via postgres (rolbypassrls = true)
--   Autorização = requireAuth / policy na aplicação (NÃO é RLS de tenant)
--   Data API    = fechada. anon/authenticated não leem tabelas Prisma.
--
-- Etapa 0 (20260902230000) só fez REVOKE nas 10 tabelas de então e
-- explicitamente NÃO tocou RLS. Tabelas posteriores (OrganizationMember,
-- Dossier, DossierSubject, SubjectIdentifier) não estavam no REVOKE
-- pontual — dependiam só de DEFAULT PRIVILEGES.
--
-- Esta migration:
--   1. REVOKE ALL em TODAS as tabelas Prisma atuais (e PUBLIC).
--   2. DROP de qualquer policy no public gerenciado (zero policies).
--   3. ENABLE ROW LEVEL SECURITY sem policy = deny-all para quem não tem
--      BYPASSRLS (anon, authenticated). postgres/service_role seguem ok.
--   4. Reafirma DEFAULT PRIVILEGES sem GRANT a anon/authenticated.
--
-- Não altera: service_role, USAGE no schema public, schemas auth/storage,
-- defaults de supabase_admin, FORCE ROW LEVEL SECURITY.
-- Não cria policy USING (true) — isso reabriria a Data API.

DO $$
DECLARE
  t text;
  pol record;
  tables text[] := ARRAY[
    'User',
    'Organization',
    'OrganizationMember',
    'Order',
    'OrderItem',
    'Payment',
    'Cartorio',
    'Product',
    'ProductField',
    'ProductPrice',
    'Dossier',
    'DossierSubject',
    'SubjectIdentifier',
    '_prisma_migrations'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = t
        AND c.relkind = 'r'
    ) THEN
      RAISE NOTICE 'skip missing table %', t;
      CONTINUE;
    END IF;

    EXECUTE format(
      'REVOKE ALL ON TABLE %I.%I FROM anon, authenticated, PUBLIC',
      'public',
      t
    );

    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I.%I',
        pol.policyname,
        'public',
        t
      );
    END LOOP;

    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      'public',
      t
    );
  END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
