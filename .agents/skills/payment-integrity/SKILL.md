---
name: payment-integrity
description: Define cobrança InterJuri server-authoritative via Mercado Pago (valor no banco, webhook assinado, reconciliação). Use ao alterar payments, webhook, card/PIX, money-cents ou status PAID.
---

# payment-integrity

## Objetivo

Só o servidor define o valor cobrado. Só o Mercado Pago (consultado de novo) marca pedido como pago, salvo a exceção administrativa abaixo. Webhook sem assinatura válida não altera nada.

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
- Estorno/chargeback no MP (`refunded`, `charged_back`): Payment → REFUNDED e, sem outro APPROVED, Order → CANCELLED com `CaseEvent` (`display: "REFUNDED"`), em qualquer etapa.

## Exceção administrativa (pagamento manual)

`PATCH /api/admin/orders/[id]/status` com `target` em `PAYMENT_APPROVED | PAYMENT_REJECTED | REFUNDED` (`src/lib/manual-payment.ts`).

- Só `requirePlatformAdmin` (UserRole.ADMIN). OPERATOR e `/api/ops` continuam sem poder definir PAID.
- Motivo obrigatório (10–500 caracteres). Autor vem do contexto, nunca do body.
- Valor = `order.totalAmount`; cria `Payment` com `provider: "MANUAL"`. Não movimenta dinheiro: estorno real é feito no MP/banco antes.
- Transação com `FOR UPDATE` no pedido; ações válidas vêm de `manualPaymentActions` (aprovar/recusar só aguardando pagamento sem APPROVED; estornar só com APPROVED).
- Toda ação grava `CaseEvent` com motivo e `manual: true`; o cliente vê só a transição (`loadOrderCase(..., "customer")`).

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
- Abrir pagamento manual para OPERATOR, aceitar valor no body ou pular o motivo.
- Logar access token / webhook secret.

## Gaps reais

- Boleto e `B2B_INVOICE` existem no enum; checkout cobra PIX/card.
- Locks in-memory (`pixLocks` / `reconcileLocks`) não cruzam instâncias.

## Validação

Webhook sem `x-signature` válida → 401.
Pedido PAID não gera novo PIX.
simulate-pay → 403.
