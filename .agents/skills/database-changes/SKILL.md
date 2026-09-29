---
name: database-changes
description: Define mudanças de schema Cartori via Prisma/Postgres (migrations, transações, Data API fechada). Use ao alterar prisma/schema.prisma, migrations, transações de onboarding/pedido ou grants Postgres.
---

# database-changes

## Objetivo

Schema e dados passam pelo Prisma. Migrations versionadas. PostgREST (anon/authenticated) não é API de produto.

## Quando usar

Novo model/enum, migration, `$transaction`, seed, grants, `DATABASE_URL` vs `DATABASE_URL_UNPOOLED`.

## Quando NÃO usar

Regra de autorização — `authorization-tenant`.
Valor de pagamento — `payment-integrity`.

## Estado atual

- ORM: `src/lib/prisma.ts` (singleton).
- Datasource: `url` = pooled `DATABASE_URL`; `directUrl` = `DATABASE_URL_UNPOOLED` (migrations).
- Comandos: `npm run db:migrate` (`prisma migrate deploy`), `db:push` (não usar como substituto de migrate em fluxo real), `db:seed`.
- Transações reais: onboarding (`persistCreatorOnboarding`), `saveOrder`, mark PAID no reconcile.
- Etapa 0: `prisma/migrations/20260902230000_revoke_data_api_anon_authenticated/` revoga ALL nas tabelas Prisma de então para `anon` e `authenticated`. Não revoga `service_role`. Não ligava RLS. Rollback no mesmo diretório.
- Lock Data API: `prisma/migrations/20260918010000_lock_public_rls_deny_data_api/` revoga ALL em **todas** as tabelas Prisma atuais (inclui `OrganizationMember`, `Dossier*`) **e** liga RLS sem policies (deny-all para `anon`/`authenticated`). `postgres` tem `rolbypassrls`; Prisma segue. Não é ACL de tenant.
- Inventário: `npx tsx scripts/inspect-supabase-rls.ts` (live) ou `--schema-only`.

## Invariantes

- Acesso a dados do app = Prisma, não Supabase Data API.
- Migration para mudança de schema; não “consertar” produção com `db push` silencioso.
- Unicidade (authId, email, cpf, cnpj, protocol, providerPaymentId) tratada como conflito de negócio, não retry cego.
- `OrganizationMember` REMOVED é linha persistida (`removedAt`); não apagar para “desfazer”.

## Fluxo correto

1. Alterar `prisma/schema.prisma`.
2. Criar migration SQL em `prisma/migrations/<timestamp>_<name>/`.
3. Nova tabela no schema `public`: **sem** GRANT a `anon`/`authenticated` (DEFAULT PRIVILEGES) **e** `ENABLE ROW LEVEL SECURITY` na mesma migration, sem `CREATE POLICY`. Confirmar com `scripts/inspect-supabase-rls.ts`.
4. `prisma generate` (postinstall já roda).
5. Não commitar `.env`.

## Helpers existentes

`prisma/schema.prisma`
`src/lib/prisma.ts`
`src/lib/org-membership.ts` (`$transaction`)
`src/lib/order-store.ts` (`saveOrder` transaction)
`prisma/migrations/`
`scripts/inspect-supabase-rls.ts`

## Não faça

- RLS de tenant / `USING (true)` como substituto de `requireAuth` (authz é na aplicação). RLS deny-all no `public` é só fechar PostgREST.
- Recriar `User.organizationId` ou papéis `B2B_*` (removidos na 6C).
- Incluir secrets na migration.

## Gaps reais

- Seed `prisma/seed.ts` pode estar em evolução / untracked — não tratar como contrato até estar no fluxo oficial.

## Validação

`scripts/etapa5-db-counts.ts`, `scripts/etapa6-db-counts.ts` (contagens, não substituem migrate).
`scripts/inspect-supabase-rls.ts` após migration de tabela/grants/RLS.
Após migration: generate + typecheck do app se o schema mudou (fora desta skill docs-only).
