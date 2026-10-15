import { describe, expect, it } from "vitest";
import {
  isManualPaymentAction,
  manualPaymentActions,
  sanitizeManualReason,
} from "@/lib/manual-payment-policy";
import { displayOrderStatus, isOrderPaid } from "@/lib/order-status";

function order(status: string, ...payments: string[]) {
  return { status, payments: payments.map((value) => ({ status: value })) };
}

describe("manualPaymentActions (exceção administrativa)", () => {
  it("pedido aguardando pagamento pode ser aprovado ou recusado", () => {
    expect(manualPaymentActions(order("PENDING_PAYMENT"))).toEqual(["PAYMENT_APPROVED", "PAYMENT_REJECTED"]);
    expect(manualPaymentActions(order("DRAFT", "REJECTED"))).toEqual(["PAYMENT_APPROVED", "PAYMENT_REJECTED"]);
  });

  it("pagamento aprovado só admite estorno", () => {
    expect(manualPaymentActions(order("PENDING_PAYMENT", "APPROVED"))).toEqual(["REFUNDED"]);
    expect(manualPaymentActions(order("IN_ANALYSIS", "APPROVED"))).toEqual(["REFUNDED"]);
  });

  it("pedido pago e cancelado pela mesa ainda permite registrar o estorno", () => {
    expect(manualPaymentActions(order("CANCELLED", "APPROVED"))).toEqual(["REFUNDED"]);
  });

  it("sem pagamento aprovado fora da fase de pagamento não há ação", () => {
    expect(manualPaymentActions(order("CANCELLED"))).toEqual([]);
    expect(manualPaymentActions(order("CANCELLED", "REFUNDED"))).toEqual([]);
    expect(manualPaymentActions(order("WAITING_CUSTOMER", "REJECTED"))).toEqual([]);
  });

  it("valida a ação e normaliza o motivo", () => {
    expect(isManualPaymentAction("PAYMENT_APPROVED")).toBe(true);
    expect(isManualPaymentAction("PAID")).toBe(false);
    expect(isManualPaymentAction(undefined)).toBe(false);
    expect(sanitizeManualReason("  PIX \n conferido  ")).toBe("PIX conferido");
    expect(sanitizeManualReason("x".repeat(600))).toHaveLength(500);
  });
});

describe("displayOrderStatus", () => {
  it("estorno vence qualquer etapa", () => {
    expect(displayOrderStatus("CANCELLED", "REFUNDED")).toBe("REFUNDED");
    expect(displayOrderStatus("COMPLETED", "REFUNDED")).toBe("REFUNDED");
  });

  it("recusa só aparece enquanto o pedido espera pagamento", () => {
    expect(displayOrderStatus("PENDING_PAYMENT", "REJECTED")).toBe("PAYMENT_REJECTED");
    expect(displayOrderStatus("CANCELLED", "REJECTED")).toBe("CANCELLED");
  });

  it("agrupa as etapas internas da mesa", () => {
    expect(displayOrderStatus("PENDING_PAYMENT", "PENDING")).toBe("PAYMENT_PENDING");
    expect(displayOrderStatus("IN_CARTORIO_SEARCH", "APPROVED")).toBe("IN_ISSUANCE");
    expect(displayOrderStatus("SHIPPED", "APPROVED")).toBe("DELIVERED");
  });

  it("pedido estornado não conta como compra", () => {
    expect(
      isOrderPaid({ status: "COMPLETED", payment: { status: "REFUNDED" } } as Parameters<typeof isOrderPaid>[0])
    ).toBe(false);
  });
});
