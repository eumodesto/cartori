---
name: catalog-certificates
description: Define catálogo de certidões e cartórios InterJuri (Product no Prisma com fallback estático). Use ao alterar produtos, preços por UF, campos de formulário, cartórios ou /api/cartorios.
---

# catalog-certificates

## Objetivo

Preço e campos da certidão vêm do catálogo servidor (`product-store` / `pricing`). Cartório é serventia persistida ou catálogo oficial, não um ID inventado no checkout.

## Quando usar

`Product`, `catalog.ts`, `crc-*-prices`, `cartorios`, rota `/api/cartorios` e formulário de certidão.

## Quando NÃO usar

Snapshot já gravado no pedido — `order-access` / `payment-integrity` (não recalcular para pagar).

## Estado atual

**Consolidado (leitura de produto):**

- `listProducts` / `getProductBySlug` em `src/lib/product-store.ts`.
- Se o banco tem produtos suficientes (`>= MVP_CERTIFICATES.length`), source `database`.
- Senão ou se a query falha: fallback `MVP_CERTIFICATES` em `src/lib/catalog.ts` + preços estáticos UF.

**Estado da busca de cartórios:**

- A implementação vigente está em `src/lib/cartorios.ts` e `src/app/api/cartorios/route.ts`.
- Não existem atualmente `src/lib/notary-offices.ts`, `src/app/api/notary-offices/route.ts` ou `src/services/locations.ts`; referências a esses caminhos são legado documental e não devem ser seguidas.
- As rotas `src/app/api/locations/*`, `src/app/api/cep/*` e `src/app/api/cnpj/*` apoiam o formulário e não são ACL.

**Não oficial:**

- Pasta `import/` e dumps CRC — material de importação, não contrato da API.
- Leftovers untracked de cartórios/Amanda não viram padrão só por existirem no working tree.

## Invariantes

- Checkout precifica com `getProductBySlug` + `priceCertificate`, não com preço digitado no item.
- `OrderItem.cartorioId` só persiste se o id existe (`findExistingCartorioIds`); senão null + snapshot do nome.
- Não inventar certidão/preço para “completar” o catálogo.

## Fluxo correto

Nova certidão: model `Product` + fields/prices (migration/seed oficial) → `product-store` lê. Fallback estático só enquanto o banco não cobre o MVP.

## Helpers existentes

`src/lib/product-store.ts`
`src/lib/catalog.ts`
`src/lib/pricing.ts`
`src/lib/crc-uf-prices.ts`
`src/lib/crc-form-fields.ts`
`src/lib/field-visibility.ts`
`src/lib/cartorios.ts`
`src/app/api/cartorios/route.ts`

## Não faça

- Tratar `import/*.json` como source of truth da API.
- Duplicar tabela de preços no cliente como autoridade.
- Documentar busca de cartório incompleta como pipeline fechado.

## Gaps reais

- Dual source database/fallback e database/catalog de cartórios: em construção.
- Cobertura de preços UF vs `basePrice` nacional ainda depende dos dados carregados.

## Validação

`product-store` expõe `source` internamente para distinguir banco de fallback. Não existe hoje a rota `/api/products`.
Checkout de slug inexistente falha no `buildOrderDraft`.
