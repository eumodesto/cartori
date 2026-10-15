---
name: security-testing
description: Define como validar regressões de identidade, autorização e tenant no InterJuri (Vitest + scripts HTTP etapa 4–6). Use ao fechar mudança de auth, org, membership, pedidos ou papéis — não em todo tweak de UI.
---

# security-testing

## Objetivo

Provar que a invariante de segurança ainda vale. Policy, regras de org e membership estão na suíte Vitest (roda no CI); os scripts `scripts/etapa*-http-check.ts` são o único check ponta a ponta das rotas.

## Quando usar

Depois de alterar `authorization*`, `auth.ts`, `org-*`, `order-access`, rotas `/api/auth`, `/api/org`, `/api/orders`. Depois de nova tabela Prisma / grants / RLS: `scripts/inspect-supabase-rls.ts`.

## Quando NÃO usar

Docs-only / Skills. Helper de UI sem auth. Catálogo estático sem ACL.

## Estado atual

Checks existentes:

| Check | Papel |
|---|---|
| `tests/unit/authorization-policy.test.ts`, `authorization-matrix.test.ts`, `auth-types.test.ts` | Policy pura / papéis / matriz |
| `tests/unit/org-rules.test.ts` | Organization ≠ Partner, uma org ACTIVE |
| `tests/db/org-membership.test.ts` | Membership no Postgres |
| `tests/db/order-store.test.ts`, `payment-reconcile.test.ts` | Pedidos, numeração, conciliação |
| `scripts/etapa4-http-check.ts` | HTTP authz etapa 4 |
| `scripts/etapa5-http-check.ts` | HTTP onboarding |
| `scripts/etapa6-http-check.ts` | HTTP membership |
| `scripts/inspect-supabase-rls.ts` | Grants + RLS deny-all (Data API fechada) |

`npm test`, `npm run test:db`, `npm run typecheck`, `npm run lint`, `npm run build`.

Os `etapa*-http-check` criam usuários no Supabase Auth e gravam no banco do `.env.local`. Só rodar contra ambiente de teste/preview, nunca com `.env.local` apontando para produção.

## Invariantes

- Fail-closed permanece nos asserts dos scripts (CLIENT sem org, pedido alheio, OPERATOR sem onboarding, etc.).
- Não “passar” um script comentando o assert.

## Fluxo correto

1. Identificar a etapa tocada (identidade / org / membership / pedidos).
2. Rodar `npm test` / `npm run test:db` **e** o HTTP check se a rota mudou.
3. Não inventar Vitest paralelo que contradiz a matriz.

## Não faça

- Suíte genérica “porque todo repo tem”.
- Teste que concede org-wide orders ou Partner só para ficar verde.
- Deploy como prova de authz.

## Gaps reais

- Rotas HTTP não têm teste automatizado no CI; os `etapa*-http-check` são manuais.
- Cobertura HTTP depende de env (Supabase, DB) — policy pura e Vitest unitário rodam sem HTTP.

## Validação

Suítes verdes. Mudança de matriz → atualizar `authorization-matrix.ts` **e** `tests/unit/authorization-matrix.test.ts`, na mesma onda.
Nova tabela Prisma → `inspect-supabase-rls.ts --schema-only` verde; live inspect quando houver `DATABASE_URL`.
