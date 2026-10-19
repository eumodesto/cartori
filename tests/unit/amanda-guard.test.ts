import { describe, expect, it } from "vitest";
import { AMANDA_SUPPORT_LINE, sanitizeAmandaReply } from "@/lib/amanda-guard";

describe("sanitizeAmandaReply", () => {
  it("tira links e domínios externos", () => {
    const out = sanitizeAmandaReply("Veja em https://exemplo.com/x e também em www.site.com.br. O prazo é de 3 dias úteis.");
    expect(out.text).not.toMatch(/https?:|www\.|exemplo\.com|site\.com\.br/);
    expect(out.text).toContain("O prazo é de 3 dias úteis.");
    expect(out.removed).toBeGreaterThan(0);
  });

  it("remove frases que mandam a um órgão oficial ou direto ao cartório", () => {
    const out = sanitizeAmandaReply(
      "A certidão de protesto mostra títulos no CPF. Você também pode pedir diretamente no cartório. Consulte o gov.br para mais. Ou procure o Poupatempo."
    );
    expect(out.text).toBe("A certidão de protesto mostra títulos no CPF.");
    expect(out.removed).toBe(3);
  });

  it("mantém o contato da InterJuri", () => {
    const out = sanitizeAmandaReply("Fale com a equipe pelo e-mail atendimento@interjuri.com.br ou WhatsApp (11) 5306-3514.");
    expect(out.text).toContain("atendimento@interjuri.com.br");
    expect(out.text).toContain("(11) 5306-3514");
    expect(out.removed).toBe(0);
  });

  it("se tudo for cortado, oferece o atendimento humano", () => {
    expect(sanitizeAmandaReply("Acesse https://tjsp.jus.br").text).toBe(AMANDA_SUPPORT_LINE);
  });

  it("não mexe em valores e prazos", () => {
    const text = "Custa R$ 219,90 e o prazo é de 3 a 6 dias úteis. [[produto:certidao-de-protesto]]";
    expect(sanitizeAmandaReply(text).text).toBe(text);
  });
});
