import { describe, expect, it } from "vitest";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import {
  toPrismaPaymentMethod,
  toPrismaPaymentStatus,
  toStoredPaymentMethod,
  toStoredPaymentStatus,
} from "@/lib/order-store";
import { toClientOrder } from "@/lib/orders";
import type { StoredOrder } from "@/lib/order-types";

describe("mapeamento de pagamento entre Prisma e StoredOrder", () => {
  it.each(Object.values(PaymentStatus))("status %s volta igual", (status) => {
    expect(toPrismaPaymentStatus(toStoredPaymentStatus(status))).toBe(status);
    expect(toStoredPaymentStatus(status)).toBe(status);
  });

  it.each(Object.values(PaymentMethod))("método %s volta igual", (method) => {
    expect(toPrismaPaymentMethod(toStoredPaymentMethod(method))).toBe(method);
    expect(toStoredPaymentMethod(method)).toBe(method);
  });
});

describe("toClientOrder", () => {
  it("expõe status e método de pagamento sem rebaixar", () => {
    const order = {
      id: "pedido",
      protocol: "CTR-1",
      status: "PAID",
      totalAmount: 10,
      items: [],
      createdAt: "2026-10-09T00:00:00.000Z",
      payment: {
        id: "pagamento",
        provider: "MERCADOPAGO",
        paymentMethod: "BOLETO",
        status: "REFUNDED",
        amount: 10,
      },
    } as unknown as StoredOrder;

    expect(toClientOrder(order).payment).toMatchObject({
      status: "REFUNDED",
      method: "BOLETO",
    });
  });
});
