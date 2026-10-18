import { describe, expect, it } from "vitest";
import { CANCEL_SERVICE_FEE, cancellationOption } from "@/lib/cancellation-policy";
import {
  addBusinessDays,
  businessDaysBetween,
  deadlineText,
  journeyCopy,
  journeyDeadline,
  journeyStepIndex,
  parseBusinessDays,
} from "@/lib/order-journey";

const DAY = 24 * 60 * 60 * 1000;

describe("cancellationOption", () => {
  const paidAt = new Date("2026-10-10T12:00:00Z");
  const approved = [{ status: "APPROVED", createdAt: paidAt }];

  it("pedido pago dentro de 7 dias: estorno com taxa de R$ 60 retida", () => {
    const option = cancellationOption({
      status: "IN_ANALYSIS",
      payments: approved,
      paidAt,
      total: 271.9,
      hasPendingRequest: false,
      now: new Date(paidAt.getTime() + 3 * DAY),
    });
    expect(option).toMatchObject({ kind: "refund", allowed: true, fee: CANCEL_SERVICE_FEE, refundAmount: 211.9 });
  });

  it("depois de 7 dias ou com certidão emitida, não cancela", () => {
    const late = cancellationOption({
      status: "IN_ANALYSIS",
      payments: approved,
      paidAt,
      total: 100,
      hasPendingRequest: false,
      now: new Date(paidAt.getTime() + 8 * DAY),
    });
    expect(late).toMatchObject({ kind: "refund", allowed: false });
    const issued = cancellationOption({
      status: "CERTIFICATE_ISSUED",
      payments: approved,
      paidAt,
      total: 100,
      hasPendingRequest: false,
      now: new Date(paidAt.getTime() + DAY),
    });
    expect(issued).toMatchObject({ kind: "refund", allowed: false });
  });

  it("total menor que a taxa: estorno zero, nunca negativo", () => {
    const option = cancellationOption({
      status: "PAID",
      payments: approved,
      paidAt,
      total: 40,
      hasPendingRequest: false,
      now: paidAt,
    });
    expect(option).toMatchObject({ kind: "refund", fee: 40, refundAmount: 0 });
  });

  it("sem pagamento: cancela na hora, mas espera PIX recente expirar", () => {
    const now = new Date("2026-10-10T12:00:00Z");
    expect(
      cancellationOption({ status: "PENDING_PAYMENT", payments: [], paidAt: null, total: 100, hasPendingRequest: false, now })
    ).toMatchObject({ kind: "cancel_unpaid", allowed: true });
    expect(
      cancellationOption({
        status: "PENDING_PAYMENT",
        payments: [{ status: "PENDING", createdAt: new Date(now.getTime() - 10 * 60 * 1000) }],
        paidAt: null,
        total: 100,
        hasPendingRequest: false,
        now,
      })
    ).toMatchObject({ kind: "cancel_unpaid", allowed: false });
  });

  it("com pedido em análise, cancelado ou estornado, não há botão", () => {
    expect(
      cancellationOption({ status: "PAID", payments: approved, paidAt, total: 100, hasPendingRequest: true }).kind
    ).toBe("none");
    expect(
      cancellationOption({ status: "CANCELLED", payments: [], paidAt: null, total: 100, hasPendingRequest: false }).kind
    ).toBe("none");
    expect(
      cancellationOption({
        status: "CANCELLED",
        payments: [{ status: "REFUNDED", createdAt: paidAt }],
        paidAt: null,
        total: 100,
        hasPendingRequest: false,
      }).kind
    ).toBe("none");
  });
});

describe("prazos em dias úteis", () => {
  it("lê o prazo do catálogo", () => {
    expect(parseBusinessDays("3 a 6 dias úteis")).toEqual({ min: 3, max: 6 });
    expect(parseBusinessDays("2 dias úteis")).toEqual({ min: 2, max: 2 });
    expect(parseBusinessDays(null)).toBeNull();
  });

  it("pula sábado e domingo", () => {
    const friday = new Date("2026-10-16T10:00:00");
    expect(addBusinessDays(friday, 1).getDay()).toBe(1);
    expect(businessDaysBetween(friday, new Date("2026-10-20T10:00:00"))).toBe(2);
  });

  it("previsão corre, pausa e atrasa", () => {
    const paidAt = new Date("2026-10-12T10:00:00");
    const running = journeyDeadline({
      internalStatus: "IN_ANALYSIS",
      paidAt,
      maxDays: { min: 3, max: 6 },
      now: new Date("2026-10-13T10:00:00"),
    });
    expect(running).toMatchObject({ kind: "running", remaining: 5 });
    expect(deadlineText(running)).toContain("faltam 5 dias úteis");
    expect(journeyDeadline({ internalStatus: "WAITING_CUSTOMER", paidAt, maxDays: { min: 3, max: 6 } })?.kind).toBe("paused");
    expect(
      journeyDeadline({ internalStatus: "IN_CARTORIO_SEARCH", paidAt, maxDays: { min: 1, max: 2 }, now: new Date("2026-10-30T10:00:00") })?.kind
    ).toBe("late");
    expect(journeyDeadline({ internalStatus: "PENDING_PAYMENT", paidAt: null, maxDays: { min: 1, max: 3 } })).toEqual({
      kind: "after_payment",
      min: 1,
      max: 3,
    });
  });
});

describe("frases por etapa", () => {
  it("cada status tem título e texto", () => {
    for (const display of [
      "PAYMENT_PENDING",
      "PAYMENT_REJECTED",
      "PAYMENT_APPROVED",
      "IN_ISSUANCE",
      "WAITING_CUSTOMER",
      "DELIVERED",
      "REFUNDED",
      "CANCELLED",
      "CANCEL_REQUESTED",
    ] as const) {
      const copy = journeyCopy(display);
      expect(copy.title.length, display).toBeGreaterThan(3);
      expect(copy.text.length, display).toBeGreaterThan(20);
    }
    expect(journeyCopy("IN_ISSUANCE", "IN_CARTORIO_SEARCH").title).toBe("No cartório");
    expect(journeyStepIndex("CERTIFICATE_ISSUED")).toBe(3);
  });
});
