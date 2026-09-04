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
- Etapa 0: `prisma/migrations/20260902230000_revoke_data_api_anon_authenticated/` revoga ALL em tabelas Prisma para `anon` e `authenticated`. Não revoga `service_role`. Rollback no mesmo diretório.
- `OrganizationMember`: no banco atual, `anon` e `authenticated` **não** têm SELECT/INSERT/UPDATE/DELETE (`relacl` só `postgres` + `service_role`). Data API fechada para essa tabela.

## Invariantes

- Acesso a dados do app = Prisma, não Supabase Data API.
- Migration para mudança de schema; não “consertar” produção com `db push` silencioso.
- Unicidade (authId, email, cpf, cnpj, protocol, providerPaymentId) tratada como conflito de negócio, não retry cego.
- `OrganizationMember` REMOVED é linha persistida (`removedAt`); não apagar para “desfazer”.

## Fluxo correto

1. Alterar `prisma/schema.prisma`.
2. Criar migration SQL em `prisma/migrations/<timestamp>_<name>/`.
3. Nova tabela no schema `public`: o padrão da Etapa 0 é **sem** GRANT a `anon`/`authenticated` (DEFAULT PRIVILEGES já revogados). Confirmar no banco se tocar Data API/PostgREST.
4. `prisma generate` (postinstall já roda).
5. Não commitar `.env`.

## Helpers existentes

`prisma/schema.prisma`
`src/lib/prisma.ts`
`src/lib/org-membership.ts` (`$transaction`)
`src/lib/order-store.ts` (`saveOrder` transaction)
`prisma/migrations/`

## Não faça

- RLS no Prisma como substituto de `requireAuth` (authz é na aplicação).
- Recriar `User.organizationId` ou papéis `B2B_*` (removidos na 6C).
- Incluir secrets na migration.

## Gaps reais

- Seed `prisma/seed.ts` pode estar em evolução / untracked — não tratar como contrato até estar no fluxo oficial.

## Validação

`scripts/etapa5-db-counts.ts`, `scripts/etapa6-db-counts.ts` (contagens, não substituem migrate).
Após migration: generate + typecheck do app se o schema mudou (fora desta skill docs-only).
