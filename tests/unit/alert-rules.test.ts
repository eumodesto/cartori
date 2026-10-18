import { describe, expect, it } from "vitest";
import {
  ALERT_ID_PATTERN,
  type UnreadAlert,
  applyReadState,
  daysBetween,
  previewText,
  sortAndLimit,
  statusAlertCopy,
} from "@/lib/alert-rules";

function alert(id: string, createdAt: string): UnreadAlert {
  return {
    id,
    kind: "message",
    audience: "customer",
    tone: "info",
    title: "t",
    body: "b",
    href: "/painel",
    createdAt,
  };
}

describe("applyReadState", () => {
  it("anterior ao 'marcar todos' é lido; depois, só o marcado um a um", () => {
    const list = [
      alert("message:a", "2026-10-10T10:00:00Z"),
      alert("message:b", "2026-10-12T10:00:00Z"),
      alert("message:c", "2026-10-13T10:00:00Z"),
    ];
    const result = applyReadState(list, new Date("2026-10-11T00:00:00Z"), new Set(["message:c"]));
    expect(result.map((item) => item.read)).toEqual([true, false, true]);
  });

  it("sem data nem marcações, tudo é não lido", () => {
    expect(applyReadState([alert("x:1", "2026-10-10T10:00:00Z")], null, new Set())[0].read).toBe(false);
  });
});

describe("textos e ordem", () => {
  it("título muda para equipe e cliente", () => {
    expect(statusAlertCopy("PAYMENT_APPROVED", "customer").title).toBe("Pagamento aprovado");
    expect(statusAlertCopy("PAYMENT_APPROVED", "staff").title).toBe("Nova compra paga");
    expect(statusAlertCopy("WAITING_CUSTOMER", "customer").tone).toBe("warning");
    expect(statusAlertCopy(null, "customer").title).toBe("Status atualizado");
  });

  it("mais recente primeiro, com limite", () => {
    const list = [alert("a:1", "2026-10-01T00:00:00Z"), alert("a:2", "2026-10-03T00:00:00Z"), alert("a:3", "2026-10-02T00:00:00Z")];
    expect(sortAndLimit(list, 2).map((item) => item.id)).toEqual(["a:2", "a:3"]);
  });

  it("prévia encurta e limpa espaços", () => {
    expect(previewText("  oi\n\n tudo  bem ")).toBe("oi tudo bem");
    expect(previewText("x".repeat(200), 10)).toHaveLength(10);
  });

  it("dias inteiros entre datas", () => {
    expect(daysBetween("2026-10-10T00:00:00Z", new Date("2026-10-12T12:00:00Z"))).toBe(2);
  });

  it("formato do id aceito no 'marcar como lido'", () => {
    expect(ALERT_ID_PATTERN.test("message:3f1c-uuid")).toBe(true);
    expect(ALERT_ID_PATTERN.test("stale:abc:1760000000000")).toBe(true);
    expect(ALERT_ID_PATTERN.test("<script>")).toBe(false);
    expect(ALERT_ID_PATTERN.test("x".repeat(300))).toBe(false);
  });
});
