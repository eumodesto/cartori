---
name: amanda-ai
description: Define o chat Amanda do InterJuri (catálogo servidor, sem inventar preço, rota pública limitada). Use ao alterar /api/amanda/chat, amanda-knowledge, amanda-products ou o widget de chat.
---

# amanda-ai

## Objetivo

Amanda explica certidões e o fluxo InterJuri com o catálogo atual. Não é canal de pedido, pagamento ou autorização.

## Quando usar

`src/app/api/amanda/chat/route.ts`, `amanda-knowledge.ts`, `amanda-products.ts`, widgets de chat.

## Quando NÃO usar

Checkout, auth, pagamentos, ACL.

## Estado atual

**No painel, depois do primeiro pedido.**

- POST `/api/amanda/chat`: OpenAI (`OPENAI_API_KEY`, modelo `OPENAI_MODEL` ou `gpt-4o-mini`).
- Só cliente autenticado (`User.role` CLIENT) com ao menos um `Order` do próprio `userId`. GET devolve `{ available }` para o widget. Sem sessão, sem pedido ou papel de mesa → a rota não chama a OpenAI.
- Widget só em `/painel` (`chat-widget-config`). Fora da vitrine, do hero, de `/operacao`, `/admin` e do design system. “Pedido” aqui é a solicitação criada no checkout, sem exigir status `PAID`.
- Histórico: no máximo 16 turnos, 2000 chars, só `user`/`assistant`.
- System prompt: `buildAmandaSystemPrompt(await listProducts())` — preços e campos do catálogo servidor.
- Sem chave → 503.
- UI: `amanda-chat`, `ai-chat-widget`, `chat-launcher`.

## Invariantes

- Preço/prazo/campos da Amanda vêm de `listProducts()`, não de alucinação solta no prompt estático.
- Pedido real continua no checkout autenticado. O chat não abre na vitrine e não substitui sessão.
- Não logar `OPENAI_API_KEY`.

## Fluxo correto

Sessão de CLIENT com pedido → mensagens sanitizadas → catálogo → system prompt → completion → `extractAmandaProducts` para cards. Sem isso a rota para antes da OpenAI.

## Helpers existentes

`src/lib/amanda-access.ts`
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

Sem sessão, sem pedido ou papel que não seja CLIENT → a OpenAI não é chamada.
Sem API key → 503.
Body sem user message → 400.
Resposta usa slugs existentes em `listProducts`.
