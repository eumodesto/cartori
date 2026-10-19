import { describe, expect, it } from "vitest";
import { buildAmandaSystemPrompt } from "@/lib/amanda-knowledge";

describe("base da Amanda", () => {
  const prompt = buildAmandaSystemPrompt("Pedido CTR-001008 · Status: Aguardando pagamento");

  it("traz a conta, o guia do site, prazos, cancelamento e atendimento humano", () => {
    expect(prompt).toContain("CTR-001008");
    expect(prompt).toContain("GUIA DO SITE");
    expect(prompt).toContain("CANCELAMENTO E ESTORNO");
    expect(prompt).toContain("FALAR COM UMA PESSOA");
    expect(prompt).toContain("(11) 5306-3514");
  });

  it("inclui as certidões da área logada", () => {
    expect(prompt).toContain("CATÁLOGO DA ÁREA LOGADA");
    expect(prompt).toMatch(/nascimento/i);
  });

  it("proíbe links e órgãos oficiais e não fala em boleto como opção", () => {
    expect(prompt).toContain("PROIBIDO");
    expect(prompt).toMatch(/Indicar órgão oficial/);
    expect(prompt).toContain("Não existe boleto");
  });
});
