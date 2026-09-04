---
name: amanda-ai
description: Define o chat Amanda do Cartori (catálogo servidor, sem inventar preço, rota pública limitada). Use ao alterar /api/amanda/chat, amanda-knowledge, amanda-products ou o widget de chat.
---

# amanda-ai

## Objetivo

Amanda explica certidões e o fluxo Cartori com o catálogo atual. Não é canal de pedido, pagamento ou autorização.

## Quando usar

`src/app/api/amanda/chat/route.ts`, `amanda-knowledge.ts`, `amanda-products.ts`, widgets de chat.

## Quando NÃO usar

Checkout, auth, pagamentos, ACL.

## Estado atual

**Em construção.**

- POST `/api/amanda/chat`: OpenAI (`OPENAI_API_KEY`, modelo `OPENAI_MODEL` ou `gpt-4o-mini`).
- Chat **público de propósito**: sem `requireAuth`. Widget na vitrine (`app/layout.tsx`, hero em `app/page.tsx`); excluído só de `/dashboard` e `/design-system`. Não há regra no código nem na docs exigindo login.
- Histórico: no máximo 16 turnos, 2000 chars, só `user`/`assistant`.
- System prompt: `buildAmandaSystemPrompt(await listProducts())` — preços e campos do catálogo servidor.
- Sem chave → 503.
- UI: `amanda-chat`, `ai-chat-widget`, `chat-launcher`.

## Invariantes

- Preço/prazo/campos da Amanda vêm de `listProducts()`, não de alucinação solta no prompt estático.
- Pedido real continua no checkout autenticado. O chat público não substitui sessão.
- Não logar `OPENAI_API_KEY`.

## Fluxo correto

Mensagens sanitizadas → carrega catálogo → system prompt → completion → `extractAmandaProducts` para cards. Pedido real continua no checkout autenticado.

## Helpers existentes

`src/lib/amanda-knowledge.ts`
`src/lib/amanda-products.ts`
`src/lib/amanda-history.ts`
`src/lib/chat-widget-config.ts`
`src/app/api/amanda/chat/route.ts`

## Não faça

- Transformar leftovers de prompt em política de auth.
- Deixar a Amanda aceitar `role: system` do cliente.
- Inventar tabela de preços paralela no knowledge.

## Gaps reais

- Qualidade do texto e cobertura de produtos acompanham o catálogo dual source (`catalog-certificates`).

## Validação

Sem API key → 503.
Body sem user message → 400.
Resposta usa slugs existentes em `listProducts`.
