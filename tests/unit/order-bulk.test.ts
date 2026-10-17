import { describe, expect, it } from "vitest";
import {
  BULK_ORDER_LIMIT,
  PENDING_PAYMENT_GRACE_MS,
  canDeleteOrder,
  ordersToCsv,
  parseBulkOrderIds,
} from "@/lib/order-bulk";

const NOW = Date.parse("2026-10-17T12:00:00Z");
const old = new Date(NOW - PENDING_PAYMENT_GRACE_MS - 1000);
const recent = new Date(NOW - 5 * 60 * 1000);
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

describe("canDeleteOrder", () => {
  it("aceita rascunho, aguardando pagamento e cancelado sem pagamento", () => {
    for (const status of ["DRAFT", "PENDING_PAYMENT", "CANCELLED"]) {
      expect(canDeleteOrder(status, [], NOW)).toBe(true);
    }
  });

  it("recusa pedido pago ou em andamento", () => {
    for (const status of ["PAID", "IN_ANALYSIS", "IN_CARTORIO_SEARCH", "WAITING_CUSTOMER", "CERTIFICATE_ISSUED", "SHIPPED", "COMPLETED"]) {
      expect(canDeleteOrder(status, [], NOW)).toBe(false);
    }
  });

  it("recusa quando há pagamento aprovado, em análise ou estornado", () => {
    for (const status of ["APPROVED", "IN_PROCESS", "REFUNDED"]) {
      expect(canDeleteOrder("CANCELLED", [{ status, createdAt: old }], NOW)).toBe(false);
    }
  });

  it("recusa PIX pendente recente e aceita o expirado", () => {
    expect(canDeleteOrder("PENDING_PAYMENT", [{ status: "PENDING", createdAt: recent }], NOW)).toBe(false);
    expect(canDeleteOrder("PENDING_PAYMENT", [{ status: "PENDING", createdAt: old }], NOW)).toBe(true);
  });

  it("aceita pagamento recusado ou cancelado", () => {
    expect(
      canDeleteOrder("CANCELLED", [{ status: "REJECTED", createdAt: recent }, { status: "CANCELLED", createdAt: recent }], NOW)
    ).toBe(true);
  });
});

describe("parseBulkOrderIds", () => {
  it("aceita UUIDs e remove repetidos", () => {
    expect(parseBulkOrderIds([uuid(1), uuid(2), uuid(1)])).toEqual([uuid(1), uuid(2)]);
  });

  it("recusa vazio, não lista, id inválido e acima do limite", () => {
    expect(parseBulkOrderIds([])).toBeNull();
    expect(parseBulkOrderIds("abc")).toBeNull();
    expect(parseBulkOrderIds([uuid(1), "1 OR 1=1"])).toBeNull();
    expect(parseBulkOrderIds(Array.from({ length: BULK_ORDER_LIMIT + 1 }, (_, i) => uuid(i)))).toBeNull();
  });
});

describe("ordersToCsv", () => {
  it("usa ; e BOM, escapa aspas e neutraliza fórmula", () => {
    const csv = ordersToCsv([
      {
        protocol: "IJ-1",
        createdAt: "2026-10-17T12:00:00Z",
        customerName: '=HYPERLINK("x")',
        customerEmail: "a@b.com",
        certificates: ["Matrícula", "Ônus"],
        statusLabel: "Pedido Cancelado",
      },
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    const line = csv.split("\r\n")[1];
    expect(line).toContain(`"'=HYPERLINK(""x"")"`);
    expect(line).toContain(`"Matrícula, Ônus"`);
    expect(line.split(";")).toHaveLength(6);
  });
});
