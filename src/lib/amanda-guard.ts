/**
 * Filtro da resposta da Amanda (puro). Regras da InterJuri: nunca link externo e nunca indicar
 * órgão oficial ou pedir direto ao cartório. Roda no servidor depois do modelo, então vale mesmo
 * se o modelo desobedecer ao prompt.
 */

/** URLs, "www." e domínios soltos (exemplo.com.br, gov.br, jus.br…). */
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|gov|jus|mp|leg|br|io|app)(?:\.br)?\b\S*/gi;

/** Frases que mandam a pessoa a um órgão oficial ou a pedir por fora. */
const OFFICIAL_PATTERNS = [
  /\bgov\.br\b/i,
  /\bsite (?:oficial|do (?:governo|tribunal|cart[oó]rio))\b/i,
  /\bportal (?:oficial|do governo|da transpar[eê]ncia)\b/i,
  /\bdiretamente (?:no|na|com o|com a|pelo|pela|junto ao|junto à) (?:cart[oó]rio|[oó]rg[aã]o|serventia|tribunal|prefeitura|receita|governo)/i,
  /\b(?:procure|procurar|dirija-se|v[aá] at[eé]|compare[cç]a|acesse) (?:o|a|ao|à) (?:cart[oó]rio|[oó]rg[aã]o|tribunal|prefeitura|receita|poupatempo|detran|inss|junta comercial)/i,
  /\b(?:receita federal|poupatempo|detran|inss|junta comercial|defensoria|minist[eé]rio p[uú]blico|corregedoria|cnj|tribunal de justi[cç]a)\b/i,
  /\b(?:e-notariado|registradores\.org|onr\b|arpen|crc nacional)\b/i,
];

const SUPPORT_LINE =
  "Para falar com uma pessoa da equipe, use o WhatsApp (11) 5306-3514, o e-mail atendimento@interjuri.com.br ou as mensagens do seu pedido no painel.";

function splitSentences(text: string) {
  return text.split(/(?<=[.!?])\s+|\n+/).filter((part) => part.trim().length > 0);
}

/** Remove links e frases que indicam órgão oficial; mantém o resto da resposta. */
export function sanitizeAmandaReply(text: string): { text: string; removed: number } {
  let removed = 0;
  const kept = splitSentences(text).filter((sentence) => {
    const official = OFFICIAL_PATTERNS.some((pattern) => pattern.test(sentence));
    // Frase com link externo sai inteira ("Acesse <link>" sem o link não faz sentido).
    const links = sentence.match(URL_PATTERN) ?? [];
    const external = links.some((link) => !/interjuri\.com\.br/i.test(link));
    if (official || external) removed += 1;
    return !official && !external;
  });
  let result = kept.join(" ");
  // Links: troca por nada (e-mail e WhatsApp da InterJuri ficam).
  result = result.replace(URL_PATTERN, (match) => {
    if (/^atendimento@interjuri\.com\.br$/i.test(match) || /interjuri\.com\.br/i.test(match)) return match;
    removed += 1;
    return "";
  });
  result = result.replace(/\s{2,}/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
  if (!result) result = SUPPORT_LINE;
  return { text: result, removed };
}

export const AMANDA_SUPPORT_LINE = SUPPORT_LINE;
