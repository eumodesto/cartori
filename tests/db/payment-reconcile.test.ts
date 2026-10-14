import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { saveOrder } from "@/lib/order-store";
import {
  MercadoPagoPaymentSnapshot,
  reconcileFetchedPayment,
} from "@/lib/payment-reconcile";
import type { StoredOrder } from "@/lib/order-types";
import {
  approvedSnapshot,
  cleanupOrders,
  makeStoredOrder,
  readOrderState,
} from "./fixtures/orders";

async function persistedOrder(overrides: Partial<StoredOrder> = {}) {
  return saveOrder(makeStoredOrder(overrides));
}

async function setState(orderId: string, status: OrderStatus, paymentStatus: PaymentStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await prisma.payment.updateMany({ where: { orderId }, data: { status: paymentStatus } });
}

beforeAll(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(async () => {
  vi.restoreAllMocks();
  await cleanupOrders();
  await prisma.$disconnect();
});

describe("reconcileFetchedPayment: caminho feliz", () => {
  it("pagamento aprovado e coerente marca Payment APPROVED e Order PAID", async () => {
    const order = await persistedOrder();
    const result = await reconcileFetchedPayment(approvedSnapshot(order));

    expect(result).toEqual({ applied: true, paid: true, reason: "paid", orderId: order.id });
    const state = await readOrderState(order.id);
    expect(state.status).toBe("PAID");
    expect(state.paymentStatus).toBe("APPROVED");
  });

  it("reprocessar o mesmo pagamento é idempotente", async () => {
    const order = await persistedOrder();
    await reconcileFetchedPayment(approvedSnapshot(order));
    const again = await reconcileFetchedPayment(approvedSnapshot(order));

    expect(again).toEqual({
      applied: false,
      paid: true,
      reason: "already_paid",
      orderId: order.id,
    });
    const state = await readOrderState(order.id);
    expect(state.status).toBe("PAID");
    expect(state.payments).toHaveLength(1);
  });
});

describe("reconcileFetchedPayment: recusas não alteram nada", () => {
  const cases: Array<{
    name: string;
    reason: string;
    snapshot: (order: StoredOrder) => MercadoPagoPaymentSnapshot;
    order?: Partial<StoredOrder>;
  }> = [
    {
      name: "external_reference ausente",
      reason: "empty_reference",
      snapshot: (order) => approvedSnapshot(order, { externalReference: undefined }),
    },
    {
      name: "external_reference de outro pedido",
      reason: "reference_mismatch",
      snapshot: (order) => approvedSnapshot(order, { externalReference: randomUUID() }),
    },
    {
      name: "metadata.order_id de outro pedido",
      reason: "reference_mismatch",
      snapshot: (order) => approvedSnapshot(order, { metadataOrderId: randomUUID() }),
    },
    {
      name: "moeda diferente de BRL",
      reason: "currency_mismatch",
      snapshot: (order) => approvedSnapshot(order, { currencyId: "USD" }),
    },
    {
      name: "moeda ausente",
      reason: "currency_mismatch",
      snapshot: (order) => approvedSnapshot(order, { currencyId: undefined }),
    },
    {
      name: "valor ausente",
      reason: "amount_mismatch",
      snapshot: (order) => approvedSnapshot(order, { transactionAmount: undefined }),
    },
    {
      name: "valor pago um centavo menor",
      reason: "amount_mismatch",
      snapshot: (order) => approvedSnapshot(order, { transactionAmount: "105.89" }),
    },
    {
      name: "Payment local com valor diferente do pedido",
      reason: "amount_mismatch",
      order: {
        payment: {
          id: randomUUID(),
          provider: "MERCADOPAGO",
          providerPaymentId: `mp-teste-${randomUUID()}`,
          paymentMethod: "PIX",
          status: "PENDING",
          amount: 1,
        },
      },
      snapshot: (order) => approvedSnapshot(order),
    },
  ];

  it.each(cases)("$name → $reason", async ({ reason, snapshot, order: overrides }) => {
    const order = await persistedOrder(overrides);
    const result = await reconcileFetchedPayment(snapshot(order));

    expect(result).toEqual({ applied: false, paid: false, reason, orderId: order.id });
    const state = await readOrderState(order.id);
    expect(state.status).toBe("PENDING_PAYMENT");
    expect(state.paymentStatus).toBe("PENDING");
  });

  it("providerPaymentId desconhecido → unlinked", async () => {
    const result = await reconcileFetchedPayment({
      id: `mp-desconhecido-${randomUUID()}`,
      status: "approved",
      currencyId: "BRL",
      transactionAmount: 105.9,
      externalReference: randomUUID(),
    });
    expect(result).toEqual({ applied: false, paid: false, reason: "unlinked" });
  });
});

describe("reconcileFetchedPayment: status não aprovado", () => {
  it("pending com Payment já PENDING → not_approved, sem escrita", async () => {
    const order = await persistedOrder();
    const result = await reconcileFetchedPayment(approvedSnapshot(order, { status: "pending" }));
    expect(result.reason).toBe("not_approved");
    expect(result.applied).toBe(false);
  });

  it.each([
    ["rejected", "REJECTED"],
    ["cancelled", "CANCELLED"],
    ["in_process", "IN_PROCESS"],
  ])("%s atualiza só o Payment para %s", async (mpStatus, expected) => {
    const order = await persistedOrder();
    const result = await reconcileFetchedPayment(approvedSnapshot(order, { status: mpStatus }));

    expect(result).toEqual({
      applied: true,
      paid: false,
      reason: "payment_status_updated",
      orderId: order.id,
    });
    const state = await readOrderState(order.id);
    expect(state.paymentStatus).toBe(expected);
    expect(state.status).toBe("PENDING_PAYMENT");
  });
});

describe("reconcileFetchedPayment: comportamento atual de defeitos conhecidos", () => {
  it.each([OrderStatus.WAITING_CUSTOMER, OrderStatus.CANCELLED])(
    "[F1] aprovado com pedido em %s → order_not_payable e Payment continua PENDING",
    async (status) => {
      const order = await persistedOrder();
      await setState(order.id, status, PaymentStatus.PENDING);

      const result = await reconcileFetchedPayment(approvedSnapshot(order));

      expect(result.reason).toBe("order_not_payable");
      const state = await readOrderState(order.id);
      expect(state.status).toBe(status);
      expect(state.paymentStatus).toBe("PENDING");
    }
  );

  it("[F2] refunded em pedido PAID muda só o Payment; Order continua PAID", async () => {
    const order = await persistedOrder();
    await setState(order.id, OrderStatus.PAID, PaymentStatus.APPROVED);

    const result = await reconcileFetchedPayment(approvedSnapshot(order, { status: "refunded" }));

    expect(result.reason).toBe("payment_status_updated");
    const state = await readOrderState(order.id);
    expect(state.paymentStatus).toBe("REFUNDED");
    expect(state.status).toBe("PAID");
  });

  it("[F2] refunded em pedido IN_ANALYSIS → order_not_payable; reembolso não é registrado", async () => {
    const order = await persistedOrder();
    await setState(order.id, OrderStatus.IN_ANALYSIS, PaymentStatus.APPROVED);

    const result = await reconcileFetchedPayment(approvedSnapshot(order, { status: "refunded" }));

    expect(result.reason).toBe("order_not_payable");
    const state = await readOrderState(order.id);
    expect(state.paymentStatus).toBe("APPROVED");
    expect(state.status).toBe("IN_ANALYSIS");
  });

  it("[F2] charged_back em pedido PAID rebaixa o Payment para PENDING", async () => {
    const order = await persistedOrder();
    await setState(order.id, OrderStatus.PAID, PaymentStatus.APPROVED);

    const result = await reconcileFetchedPayment(
      approvedSnapshot(order, { status: "charged_back" })
    );

    expect(result.reason).toBe("payment_status_updated");
    const state = await readOrderState(order.id);
    expect(state.paymentStatus).toBe("PENDING");
    expect(state.status).toBe("PAID");
  });
});
