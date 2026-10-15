import { describe, expect, it } from "vitest";
import { isOrderPaid } from "@/lib/order-status";

const order = (status: string, paymentStatus?: string) => ({
  status,
  payment: paymentStatus ? { status: paymentStatus, amount: 10 } : null,
});

describe("isOrderPaid (gatilho da página de obrigado e da conversão)", () => {
  it.each(["PAID", "IN_ANALYSIS", "IN_CARTORIO_SEARCH", "CERTIFICATE_ISSUED", "SHIPPED", "COMPLETED"])(
    "%s conta como pago",
    (status) => {
      expect(isOrderPaid(order(status))).toBe(true);
    }
  );

  it.each(["DRAFT", "PENDING_PAYMENT", "WAITING_CUSTOMER"])(
    "%s sem pagamento aprovado não conta",
    (status) => {
      expect(isOrderPaid(order(status, "PENDING"))).toBe(false);
    }
  );

  it("pagamento aprovado antes do reconcile mover o pedido já conta", () => {
    expect(isOrderPaid(order("PENDING_PAYMENT", "APPROVED"))).toBe(true);
  });

  it("cancelado nunca conta como compra, mesmo com pagamento aprovado", () => {
    expect(isOrderPaid(order("CANCELLED", "APPROVED"))).toBe(false);
  });

  it("sem pedido não conta", () => {
    expect(isOrderPaid(null)).toBe(false);
  });
});
