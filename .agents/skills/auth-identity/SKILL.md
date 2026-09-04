---
name: auth-identity
description: Define identidade canônica Cartori (Supabase Auth + User.authId, CPF/e-mail únicos). Use ao alterar login, signup, callback, syncAuthUser, getAuthProfile ou vínculo de conta Prisma.
---

# auth-identity

## Objetivo

Uma sessão Supabase mapeia para um único `User` Prisma via `authId`. CPF e e-mail não transferem identidade.

## Quando usar

Login, signup, `/auth/callback`, `GET /api/auth/me`, `syncAuthUser`, conflitos de CPF/e-mail.

## Quando NÃO usar

Autorização de recurso / tenant — skill `authorization-tenant`.
Pedido e pagamento — skills `order-access` e `payment-integrity`.

## Estado atual

- Sessão: `createServerSupabase()` + `supabase.auth.getUser()`.
- Perfil: `getAuthProfile()` lê `User` por `authId` e anexa a **primeira** membership ACTIVE (ordenada por `createdAt`).
- Signup: cria Auth user (service role quando necessário) e Prisma `User` com `role: CLIENT`.
- `syncAuthUser` liga/atualiza o Prisma user; 409 `IdentityConflictError` se CPF/e-mail já pertencem a outra conta.
- Pedidos órfãos (`userId` null, mesmo e-mail) podem ser ligados no create — não é takeover por CPF.

## Invariantes

- Identidade canônica = `authId`. Não resolver usuário só por e-mail/CPF para conceder sessão.
- Não sobrescrever `cpf` já preenchido com outro valor (exceto se o destino não tiver dono).
- Conflito de identidade → 409, não merge silencioso.
- `createAdminSupabase()` (service role) só para operações Auth (confirmar/apagar user no signup). Não substitui Prisma nem autorização.

## Fluxo correto

1. `getUser()` na sessão.
2. `prisma.user.findUnique({ where: { authId } })`.
3. Sem row → 403 “Conta não encontrada” em rotas autenticadas (`requireAuth`); `getAuthProfile` devolve null.
4. Signup/sync: checar unicidade CPF/e-mail **antes** de criar; tratar P2002.

## Helpers existentes

`src/lib/auth.ts` (`getAuthProfile`, `syncAuthUser`, `IdentityConflictError`)
`src/lib/auth-types.ts` (`AuthProfile`)
`src/lib/supabase/server.ts`, `route.ts`, `admin.ts`
`src/app/api/auth/login/route.ts`, `signup/route.ts`, `me/route.ts`
`src/app/auth/callback/route.ts`

## Não faça

- Confiar em `user.id` do body.
- Usar CPF para “encontrar e logar” outra conta.
- Promover `User.role` no signup/onboarding.
- Inventar multi-conta Auth por e-mail.

## Gaps reais

- Mais de uma membership ACTIVE: perfil e contexto pegam a primeira e só logam warning. Multi-org não é produto.

## Validação

- Signup com CPF já usado → 409.
- `GET /api/auth/me` sem sessão → `profile: null`.
- Script: `scripts/etapa4-authorization-check.ts` (identidade vs papel).
