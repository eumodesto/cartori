-- Rollback manual. NÃO restaurar GRANT a anon/authenticated.
-- NÃO recriar policies. Só desliga RLS se precisar depurar o catalog.
-- Não executar via prisma migrate.

DO $$
DECLARE
  t text;
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
    IF EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = t
        AND c.relkind = 'r'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY',
        'public',
        t
      );
    END IF;
  END LOOP;
END $$;
