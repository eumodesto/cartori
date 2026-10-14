import { describe, expect, it } from "vitest";
import { snapshotMercadoPagoPayment } from "@/lib/payment-reconcile";

describe("snapshotMercadoPagoPayment", () => {
  it("extrai os campos usados na conciliação", () => {
    expect(
      snapshotMercadoPagoPayment({
        id: 123,
        status: "approved",
        currency_id: "BRL",
        transaction_amount: 150.5,
        external_reference: " order-1 ",
        metadata: { order_id: "order-1" },
      })
    ).toEqual({
      id: "123",
      status: "approved",
      currencyId: "BRL",
      transactionAmount: 150.5,
      externalReference: "order-1",
      metadataOrderId: "order-1",
    });
  });

  it("recusa payload sem id", () => {
    expect(snapshotMercadoPagoPayment(null)).toBeNull();
    expect(snapshotMercadoPagoPayment("x")).toBeNull();
    expect(snapshotMercadoPagoPayment({})).toBeNull();
    expect(snapshotMercadoPagoPayment({ id: "" })).toBeNull();
  });

  it("ignora tipos inesperados em vez de confiar neles", () => {
    const snapshot = snapshotMercadoPagoPayment({
      id: "9",
      status: 1,
      currency_id: ["BRL"],
      external_reference: 42,
      metadata: ["order-1"],
    });
    expect(snapshot).toEqual({
      id: "9",
      status: undefined,
      currencyId: undefined,
      transactionAmount: undefined,
      externalReference: undefined,
      metadataOrderId: undefined,
    });
  });

  it("metadata.order_id vazio vira ausente", () => {
    const snapshot = snapshotMercadoPagoPayment({ id: "9", metadata: { order_id: "  " } });
    expect(snapshot?.metadataOrderId).toBeUndefined();
  });
});
