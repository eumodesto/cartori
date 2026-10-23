import { describe, expect, it } from "vitest";
import { EMAIL_FOOTER_LINKS, renderBrandedEmail } from "@/lib/email-layout";
import { SITE_URL } from "@/lib/seo";
import { SUPPORT_COMPANY } from "@/lib/support-contacts";

const BODY =
  "Olá, Ana <script>alert(1)</script>!\n\nAcompanhe pelo painel:\nhttps://interjuri.com.br/painel/pedidos/abc\n\nDúvidas? Veja https://interjuri.com.br/suporte.\n\nEquipe InterJuri";

describe("renderBrandedEmail", () => {
  const { html, text } = renderBrandedEmail("InterJuri · pedido 123", BODY);

  it("traz logotipo, CNPJ e links do rodapé", () => {
    expect(html).toContain(`${SITE_URL}/brand/interjuri-logo.png`);
    expect(html).toContain(SUPPORT_COMPANY.cnpj);
    for (const link of EMAIL_FOOTER_LINKS) expect(html).toContain(link.href);
    expect(EMAIL_FOOTER_LINKS.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        `${SITE_URL}/#certidoes`,
        `${SITE_URL}/painel`,
        `${SITE_URL}/termos`,
        `${SITE_URL}/privacidade`,
      ])
    );
  });

  it("escapa o conteúdo do template", () => {
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("linha só com link vira botão; link no meio do texto fica sem a pontuação", () => {
    expect(html).toContain("Abrir na área do cliente");
    expect(html).toContain('href="https://interjuri.com.br/painel/pedidos/abc"');
    expect(html).toContain('href="https://interjuri.com.br/suporte"');
    expect(html).not.toContain('href="https://interjuri.com.br/suporte."');
  });

  it("texto puro mantém o corpo e ganha o mesmo rodapé", () => {
    expect(text.startsWith(BODY)).toBe(true);
    expect(text).toContain(SUPPORT_COMPANY.cnpj);
    expect(text).toContain(`Área do cliente: ${SITE_URL}/painel`);
  });
});
