import { SITE_URL } from "@/lib/seo";
import { SUPPORT_COMPANY, SUPPORT_EMAIL } from "@/lib/support-contacts";

/**
 * Layout de marca aplicado a todo e-mail enviado (templates do banco, defaults e avisos do caso).
 * O corpo continua sendo texto: aqui ele vira HTML escapado, com links clicáveis,
 * e a versão em texto puro ganha o mesmo rodapé.
 */

const NAVY = "#021F50";
const BLUE = "#006DFD";
const MUTED = "#5A6880";
const BORDER = "#E3E8F0";

const LOGO_URL = `${SITE_URL}/brand/interjuri-logo.png`;

export const EMAIL_FOOTER_LINKS = [
  { label: "Solicitar certidões", href: `${SITE_URL}/#certidoes` },
  { label: "Área do cliente", href: `${SITE_URL}/painel` },
  { label: "Meus pedidos", href: `${SITE_URL}/painel/pedidos` },
  { label: "Suporte", href: `${SITE_URL}/suporte` },
  { label: "Termos de Uso", href: `${SITE_URL}/termos` },
  { label: "Política de Privacidade", href: `${SITE_URL}/privacidade` },
] as const;

const COMPANY_LINE = `${SUPPORT_COMPANY.legalName} · CNPJ ${SUPPORT_COMPANY.cnpj} · ${SUPPORT_COMPANY.city}`;
const DISCLAIMER =
  "A InterJuri é uma empresa privada de intermediação documental, sem vínculo com cartórios, tribunais ou órgãos públicos.";

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Pontuação final não faz parte do link ("…/painel." → "…/painel"). */
function splitTrailingPunctuation(url: string) {
  const match = url.match(/[.,;:!?)]+$/);
  return match ? [url.slice(0, -match[0].length), match[0]] : [url, ""];
}

function linkify(line: string) {
  let html = "";
  let last = 0;
  for (const match of line.matchAll(URL_PATTERN)) {
    const [url, trailing] = splitTrailingPunctuation(match[0]);
    html += escapeHtml(line.slice(last, match.index));
    html += `<a href="${escapeHtml(url)}" style="color:${BLUE};text-decoration:underline;word-break:break-all;">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
    last = (match.index ?? 0) + match[0].length;
  }
  return html + escapeHtml(line.slice(last));
}

function buttonLabel(url: string) {
  return /\/painel(\/|$|\?)/.test(url) ? "Abrir na área do cliente" : "Abrir link";
}

function button(url: string) {
  const href = escapeHtml(url);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;"><tr><td style="border-radius:8px;background:${BLUE};"><a href="${href}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">${buttonLabel(url)}</a></td></tr></table>`;
}

/** Parágrafos separados por linha em branco; linha que é só um link vira botão. */
function bodyToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      const parts: string[] = [];
      let paragraph: string[] = [];
      const flush = () => {
        if (paragraph.length === 0) return;
        parts.push(
          `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${NAVY};">${paragraph.join("<br>")}</p>`
        );
        paragraph = [];
      };
      for (const line of lines) {
        const trimmed = line.trim();
        const [onlyUrl] = splitTrailingPunctuation(trimmed);
        if (/^https?:\/\/\S+$/.test(trimmed) && onlyUrl) {
          flush();
          parts.push(button(onlyUrl));
        } else {
          paragraph.push(linkify(line));
        }
      }
      flush();
      return parts.join("");
    })
    .join("");
}

function footerHtml() {
  const links = EMAIL_FOOTER_LINKS.map(
    (link) =>
      `<a href="${link.href}" style="color:${BLUE};text-decoration:none;white-space:nowrap;">${link.label}</a>`
  ).join(`<span style="color:${BORDER};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`);
  return [
    `<p style="margin:0 0 12px;font-size:13px;line-height:2;">${links}</p>`,
    `<p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${MUTED};">Atendimento: <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a></p>`,
    `<p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${MUTED};">${escapeHtml(COMPANY_LINE)}</p>`,
    `<p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${MUTED};">${escapeHtml(DISCLAIMER)}</p>`,
    `<p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">Preferências de e-mail: <a href="${SITE_URL}/painel/perfil" style="color:${MUTED};">área do cliente › Perfil</a>.</p>`,
  ].join("");
}

function footerText() {
  return [
    "—",
    "InterJuri · certidões online em todo o Brasil",
    ...EMAIL_FOOTER_LINKS.map((link) => `${link.label}: ${link.href}`),
    `Atendimento: ${SUPPORT_EMAIL}`,
    COMPANY_LINE,
    DISCLAIMER,
  ].join("\n");
}

export function renderBrandedEmail(subject: string, text: string): { html: string; text: string } {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F3F6FB;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F6FB;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
<tr><td style="height:4px;background:${BLUE};line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:24px 32px 8px;">
<a href="${SITE_URL}" style="text-decoration:none;"><img src="${LOGO_URL}" width="168" alt="InterJuri" style="display:block;width:168px;height:auto;border:0;"></a>
</td></tr>
<tr><td style="padding:16px 32px 8px;">${bodyToHtml(text)}</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid ${BORDER};background:#FAFBFD;">${footerHtml()}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { html, text: `${text.trimEnd()}\n\n${footerText()}\n` };
}
