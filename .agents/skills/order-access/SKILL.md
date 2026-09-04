---
name: order-access
description: Define ownership de pedidos Cartori e criação no checkout (userId do contexto, preço no servidor). Use ao alterar /api/orders, checkout, order-store, order-access ou listagens de solicitações.
---

# order-access

## Objetivo

Pedido autenticado nasce e é lido pelo `userId` do contexto. Membership não abre a lista da empresa. Preço do item é calculado no servidor.

## Quando usar

`GET/POST /api/orders`, `GET /api/orders/[id]`, card, checkout, `order-store`, `buildStoredOrder`.

## Quando NÃO usar

Cobrança Mercado Pago / webhook — `payment-integrity`.
Catálogo de certidões em si — `catalog-certificates`.

## Estado atual

Criação (`POST /api/orders`):

- Exige `requireAuth`.
- Dono: `orderOwnerFromContext(auth.context)` → `{ userId, organizationId }`.
- Body `role` / `userId` / `organizationId` / `sellerOrgId` **não** definem dono.
- Itens: `buildStoredOrder` → `getProductBySlug` + `priceCertificate` (snapshot no pedido).
- Canal default `CARTORI`, `kind` OWN, `sellerOrgId` null.

Leitura:

- Lista: `listOrdersByUser(context.userId)` — `where: { userId }`. Sem OR por `organizationId`.
- Um pedido: `requireOrderAccess` / `loadOwnedOrder` → `getOwnedOrder(id, userId)`. Sem row → 404.

`Order.organizationId` grava o tenant atual (contexto). Não autoriza colega da mesma org.

`getOrderById` existe para persistência interna (save/charge). **Não** usar em API de leitura.

## Invariantes

- Ownership B2C = `order.userId === context.userId`.
- Pedido alheio → 404 (`order_not_owned`).
- ADMIN/OPERATOR **não** leem pedido de outro usuário nesta etapa (matriz DENY / FUTURE).
- Valor cobrado depois vem do total persistido — skill `payment-integrity`.

## Fluxo correto

Checkout autenticado → POST `/api/orders` com customer + items → servidor monta e precifica → PIX ou card → redireciona ao pedido.

## Helpers existentes

`src/lib/order-access.ts`
`src/lib/order-store.ts` (`getOwnedOrder`, `listOrdersByUser`, `saveOrder`)
`src/lib/orders.ts` (`buildStoredOrder`, `toClientOrder`)
`src/lib/pricing.ts`
`src/app/api/orders/route.ts`
`src/app/api/orders/[id]/route.ts`
`src/app/checkout/page.tsx`

## Não faça

- `findUnique({ where: { id } })` em rota de cliente.
- `where: { OR: [{ userId }, { organizationId }] }`.
- Confiar no total enviado pelo browser.
- Implementar lista org-wide (DENY / TBD na matriz).

## Gaps reais

- Pedidos da Organization: DENY. Não inventar ACL.
- Channel PARTNER / RESELL: campos no schema; checkout atual não ativa revenda.

## Validação

Pedido de outro userId → 404.
POST autentica e grava `userId` do contexto.
Scripts HTTP das etapas 4–6 cobrem ownership, não o catálogo.
