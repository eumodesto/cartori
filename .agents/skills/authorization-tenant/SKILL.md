---
name: authorization-tenant
description: Define autorização server-side e isolamento de tenant InterJuri (AuthContext, Membership ACTIVE, Organization ≠ Partner). Use ao alterar requireAuth, rotas /api/org, papéis, dashboard B2B ou qualquer checagem de permissão.
---

# authorization-tenant

## Objetivo

Toda capacidade passa por `requireAuth` + policy pura. Tenant = membership ACTIVE. Fail-closed. Organization não é Partner.

## Quando usar

Nova rota autenticada, onboarding empresarial, checagem de org, papéis de plataforma vs org, UI B2B locked.

## Quando NÃO usar

Identidade (quem é o user) — `auth-identity`.
ACL de pedido — `order-access`.

## Estado atual

`requireAuth()` (`src/lib/authorization.ts`):

1. Sessão Supabase.
2. `User` por `authId` (senão 403).
3. Memberships `status: ACTIVE` apenas.
4. `buildAuthContext` — uma org: `pickSingleActiveMembership` (primeira por `createdAt`).

Papéis:

| Campo | Enum | Significado |
|---|---|---|
| `platformRole` / `User.role` | CLIENT, OPERATOR, ADMIN | Plataforma InterJuri |
| `orgRole` | OWNER, ADMIN, MEMBER | Papel **dentro** da org |

`OrganizationMemberRole.ADMIN` ≠ `UserRole.ADMIN`. Comparar papéis com igualdade, nunca `includes("ADMIN")`.

Onboarding (`POST /api/org`, alias `POST /api/org/partner`):

- Só `CLIENT` sem membership, ou OWNER/ADMIN ACTIVE da mesma org.
- Cria/atualiza `Organization` **STANDARD** + membership OWNER ACTIVE na mesma transação.
- Não promove `User.role`. Não concede PARTNER (`planAfterBusinessOnboarding`).
- MEMBER não onboarding. OPERATOR/ADMIN plataforma não onboarding.
- Uma conta, uma org ACTIVE (`wouldViolateSingleOrg`).
- Membership REMOVED **não** é reativada neste fluxo.

Matriz: `src/lib/authorization-matrix.ts` (ALLOW / DENY / FUTURE / TBD).

UI dashboard: `isBusinessLockedHref` / `B2B_LOCKED_HREFS` trava dossiês, organização, equipe, financeiro **no cliente**. Isso **não** é autorização.

## Invariantes

- Fail-closed: capacidade desconhecida → deny.
- OPERATOR não herda bypass de ADMIN. Bypass de org só com `allowGlobalAdmin: true` **e** `platformRole === ADMIN` (hoje nenhuma API usa isso como produto).
- Acesso à org: `canAccessOrganization` — membership ACTIVE naquele id. Sem id → false.
- Recurso privado inexistente ou sem acesso → **404**, não 403 vazando existência (`privateNotFoundResponse`).
- Organization ≠ Partner. `Organization.plan === PARTNER` é condição comercial; ativação **TBD**.
- Membership ≠ Partner. Ter org STANDARD não é ser Partner (`isPartnerAccount` exige plan PARTNER **e** `cnpjVerifiedAt`).

## Fluxo correto (rota)

1. `const auth = await requireAuth(); if (!auth.ok) return auth.response;`
2. Policy específica (`requireRole`, `requireOrganizationAccess`, `requireBusinessOnboarding`).
3. Nunca ler `role` / `organizationId` do body para autorizar.

## Helpers existentes

`src/lib/authorization.ts` — HTTP wrappers (`requirePlatformAdmin(resourceType)` protege todo `/api/admin/*`, 403)
`src/lib/case-access.ts` — `requireStaffOps` protege `/api/ops/*` (404 para não-equipe)
`src/lib/auth-types.ts` — `isStaffProfile` / `isPlatformAdminProfile`: espelhos de UI, nunca autorizam
`src/components/layout/area-links.tsx` — atalhos entre painel, mesa e admin (guarda de UI fica só no layout da seção)
`src/lib/authorization-policy.ts` — funções puras
`src/lib/authorization-matrix.ts`
`src/lib/org-membership.ts` — persistência
`src/lib/org-onboarding.ts` / `org-plan.ts`
`src/lib/auth-types.ts` — `isBusinessAccount`, `isPartnerAccount`
`src/app/api/org/route.ts`, `src/app/api/org/partner/route.ts` (alias, não ativa Partner)

## Não faça

- Implementar convites/equipe (FUTURE — página é `PartnerGate`).
- Detalhar permissões de MEMBER além do que a matriz nega.
- Acesso org-wide a pedidos.
- Política de ativação Partner.
- Multi-org.
- Tratar lock de sidebar como authz.

## Gaps reais / TBD

- Equipe / invites: FUTURE.
- ADMIN global InterJuri (usuários/papéis): FUTURE.
- Mesa operacional do **pedido**: ALLOW para OPERATOR e ADMIN (`/api/ops`, `canOperateCases`). Assignment por operador TBD.
- Ativação Partner: TBD.

## Validação

`tests/unit/authorization-policy.test.ts` / `authorization-matrix.test.ts` / `org-rules.test.ts`
`tests/db/org-membership.test.ts`
`scripts/etapa4-http-check.ts` / `etapa5-http-check.ts` / `etapa6-http-check.ts` (HTTP, manuais)
