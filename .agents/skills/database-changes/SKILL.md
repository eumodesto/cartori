---
name: database-changes
description: Define mudanças de schema InterJuri via Prisma/Postgres (migrations, transações, Data API fechada). Use ao alterar prisma/schema.prisma, migrations, transações de onboarding/pedido ou grants Postgres.
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
- Comandos: `npm run db:migrate` (`prisma migrate deploy`). Não há `prisma/seed.ts` ou script oficial `db:seed` no estado atual. Banco de teste local (Docker, `127.0.0.1:54329/cartori_test`): `db:test:up`, `db:test:migrate`, `db:test:reset`, `db:test:down`, `test:db`.
- Produção aplica migrations no build da Vercel (`scripts/vercel-build.mjs` → `prisma migrate deploy`).
- `prisma migrate dev` e `migrate diff --from-migrations` **não funcionam**: a shadow DB quebra em `20260902230000` (REVOKE em `_prisma_migrations`). Ver fluxo abaixo.
- Legado recuperado: `PlatformAuditLog` (`20260906180000`) e `User.staffPermissions` (`20260909160000`) existem em produção sem uso no código; estão no schema para o diff não gerar DROP.
- Transações reais: onboarding (`persistCreatorOnboarding`), `createOrder` (advisory lock na numeração), `saveOrder`, mark PAID no reconcile.
- Etapa 0: `prisma/migrations/20260902230000_revoke_data_api_anon_authenticated/` revoga ALL nas tabelas Prisma de então para `anon` e `authenticated`. Não revoga `service_role`. Não ligava RLS. Rollback no mesmo diretório.
- Lock Data API: `prisma/migrations/20260918010000_lock_public_rls_deny_data_api/` revoga ALL em **todas** as tabelas Prisma atuais (inclui `OrganizationMember`, `Dossier*`) **e** liga RLS sem policies (deny-all para `anon`/`authenticated`). `postgres` tem `rolbypassrls`; Prisma segue. Não é ACL de tenant.
- Inventário: `npx tsx scripts/inspect-supabase-rls.ts` (live) ou `--schema-only`.

## Invariantes

- Acesso a dados do app = Prisma, não Supabase Data API.
- Migration para mudança de schema; não “consertar” produção com `db push` silencioso.
- Unicidade (authId, email, cpf, cnpj, protocol, providerPaymentId) tratada como conflito de negócio, não retry cego.
- `OrganizationMember` REMOVED é linha persistida (`removedAt`); não apagar para “desfazer”.

## Fluxo correto

1. `npm run db:test:reset` (banco de teste = estado exato das migrations versionadas).
2. Alterar `prisma/schema.prisma`.
3. Gerar o SQL sem shadow DB, apontando para o banco de teste (nunca para produção):
   `npx prisma migrate diff --from-url postgresql://postgres:postgres@127.0.0.1:54329/cartori_test --to-schema-datamodel prisma/schema.prisma --script`
   e salvar em `prisma/migrations/<timestamp>_<name>/migration.sql`. Revisar à mão (DROP inesperado = schema divergente).
4. Nova tabela no schema `public`: **sem** GRANT a `anon`/`authenticated` (DEFAULT PRIVILEGES) **e** `ENABLE ROW LEVEL SECURITY` na mesma migration, sem `CREATE POLICY`. Confirmar com `scripts/inspect-supabase-rls.ts`.
5. `npm run db:test:reset` de novo e repetir o diff com `--exit-code`: tem de sair 0 ("No difference detected").
6. `prisma generate` (postinstall já roda), `npm run test:db`, `npm run typecheck`.
7. Checksum do Prisma = sha256 dos bytes. Com `core.autocrlf=true` o checkout no Windows tem CRLF e o da Vercel tem LF: aplicar em produção só pelo build da Vercel, nunca `migrate deploy` local contra produção (gera checksum divergente; `20260918040000`, `20261008180000` e `20261008193000` já estão assim).
8. Não commitar `.env`.

Antes de deploy, conferir produção só leitura: `npx prisma migrate status` e `migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script` (deve ser migration vazia antes da nova entrar).

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
- Criar ou alterar tabela, coluna, índice ou grant pelo painel/SQL editor do Supabase. Objetos criados por `supabase_admin` herdam DEFAULT PRIVILEGES que concedem acesso a `anon`/`authenticated`, e ficam fora do histórico (foi assim que `PlatformAuditLog` e `staffPermissions` se perderam).
- Editar migration já aplicada, nem linhas de `_prisma_migrations`. Correção = migration nova.
- `prisma db push` contra qualquer banco compartilhado.

## Gaps reais

- Seed `prisma/seed.ts` pode estar em evolução / untracked — não tratar como contrato até estar no fluxo oficial.

## Validação

`npm run test:db` (Postgres 17 em Docker com todas as migrations; CI repete em `.github/workflows/ci.yml`).
`scripts/inspect-supabase-rls.ts` após migration de tabela/grants/RLS.
Após migration: generate + typecheck do app se o schema mudou (fora desta skill docs-only).
