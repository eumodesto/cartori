---
name: payment-integrity
description: Define cobrança Cartori server-authoritative via Mercado Pago (valor no banco, webhook assinado, reconciliação). Use ao alterar payments, webhook, card/PIX, money-cents ou status PAID.
---

# payment-integrity

## Objetivo

Só o servidor define o valor cobrado. Só o Mercado Pago (consultado de novo) marca pedido como pago. Webhook sem assinatura válida não altera nada.

## Quando usar

`src/lib/payments.ts`, webhook, `payment-reconcile`, rotas `card` / PIX, tokens MP.

## Quando NÃO usar

Criar o pedido / ownership — `order-access`.

## Estado atual

- Valor: `getOrderChargeAmount(orderId)` no banco → `chargeAmountNumber`. Não usar `order.totalAmount` do cliente.
- PIX/card: `issuePixForOrder` / `chargeCardForOrder` com Access Token no servidor.
- Brick do cartão no browser só tokeniza; a captura é `createCardPayment`.
- Após criar o payment no MP, persiste e chama `reconcileMercadoPagoPayment`.
- Webhook `POST /api/payments/webhook`: `assertMercadoPagoWebhookSignature` (secret obrigatório). GET → 405.
- Reconcile: busca o payment **no MP**, casa `external_reference` e metadata `order_id` com `Order.id`, moeda BRL, centavos iguais a `order.totalAmount` e `payment.amount`, status do pedido pagável. Aí marca APPROVED + PAID na mesma transação. Idempotente se já pago.
- `POST /api/orders/[id]/simulate-pay` → 403 desativado.

## Invariantes

- Pagamento é server-authoritative.
- Assinatura inválida ou secret ausente → 401, sem reconcile.
- Amount mismatch / reference mismatch / currency ≠ BRL → não paga.
- Status não `approved` no MP → no máximo atualiza status local do Payment; não promove Order para PAID.
- Não reativar simulação de pagamento em produção.

## Fluxo correto

1. Pedido persistido com total servidor.
2. Cobra no MP com esse total.
3. Salva `providerPaymentId`.
4. Reconcile (pós-charge e/ou webhook) consulta MP de novo.
5. Só então PAID.

## Helpers existentes

`src/lib/payments.ts`
`src/lib/payment-reconcile.ts`
`src/lib/mercadopago.ts`
`src/lib/mercadopago-webhook.ts`
`src/lib/money-cents.ts`
`src/app/api/payments/webhook/route.ts`
`src/app/api/orders/[id]/card/route.ts`

## Não faça

- Confiar no body `amount` / `status: PAID`.
- Marcar pago só porque o webhook chegou, sem fetch MP.
- Logar access token / webhook secret.

## Gaps reais

- Boleto e `B2B_INVOICE` existem no enum; checkout cobra PIX/card.
- Locks in-memory (`pixLocks` / `reconcileLocks`) não cruzam instâncias.

## Validação

Webhook sem `x-signature` válida → 401.
Pedido PAID não gera novo PIX.
simulate-pay → 403.
