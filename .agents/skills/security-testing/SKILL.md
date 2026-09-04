---
name: security-testing
description: Define como validar regressões de identidade, autorização e tenant no Cartori (scripts etapa 4–6). Use ao fechar mudança de auth, org, membership, pedidos ou papéis — não em todo tweak de UI.
---

# security-testing

## Objetivo

Provar que a invariante de segurança ainda vale. O Cartori não tem suíte Vitest no `package.json`; a regressão de authz está nos scripts `scripts/etapa*`.

## Quando usar

Depois de alterar `authorization*`, `auth.ts`, `org-*`, `order-access`, rotas `/api/auth`, `/api/org`, `/api/orders`.

## Quando NÃO usar

Docs-only / Skills. Helper de UI sem auth. Catálogo estático sem ACL.

## Estado atual

Não há `"test"` no `package.json`. Checks existentes:

| Script | Papel |
|---|---|
| `scripts/etapa4-authorization-check.ts` | Policy pura / papéis |
| `scripts/etapa4-http-check.ts` | HTTP authz etapa 4 |
| `scripts/etapa5-org-check.ts` | Organization ≠ Partner |
| `scripts/etapa5-http-check.ts` | HTTP onboarding |
| `scripts/etapa5-db-counts.ts` | Contagens DB etapa 5 |
| `scripts/etapa6-org-member-check.ts` | Membership |
| `scripts/etapa6b-authorization-check.ts` | Policy 6B (ACTIVE) |
| `scripts/etapa6-http-check.ts` | HTTP membership |
| `scripts/etapa6-db-counts.ts` | Contagens 6B/6C |

Typecheck/lint/build: `npx tsc --noEmit` (se tsconfig permitir), `npm run lint`, `npm run build`. Não há script `typecheck` nomeado.

## Invariantes

- Fail-closed permanece nos asserts dos scripts (CLIENT sem org, pedido alheio, OPERATOR sem onboarding, etc.).
- Não “passar” um script comentando o assert.

## Fluxo correto

1. Identificar a etapa tocada (identidade / org / membership / pedidos).
2. Rodar o script de policy correspondente **e** o HTTP se a rota mudou.
3. Não inventar Vitest paralelo que contradiz a matriz.

## Não faça

- Suíte genérica “porque todo repo tem”.
- Teste que concede org-wide orders ou Partner só para ficar verde.
- Deploy como prova de authz.

## Gaps reais

- Sem runner `npm test`. Scripts são manuais (`npx tsx scripts/...` conforme o ambiente).
- Cobertura HTTP depende de env (Supabase, DB) — policy pura roda sem HTTP.

## Validação

Policy scripts exit 0. Mudança de matriz → atualizar `authorization-matrix.ts` **e** o script que a espelha, na mesma onda.
