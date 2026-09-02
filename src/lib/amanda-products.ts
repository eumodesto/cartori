import { MVP_CERTIFICATES, getCertificateBySlug } from "@/lib/catalog";
import { startingPriceFor } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

export type AmandaProductLink = {
  slug: string;
  name: string;
  priceLabel: string;
  estimatedDays: string;
};

const PRODUCT_MARKER = /\[\[produto:([a-z0-9-]+)\]\]/gi;
const CLOSE_MARKER = /\[\[encerrar\]\]/gi;

function extraAliases(slug: string): string[] {
  switch (slug) {
    case "certidao-de-nascimento":
      return ["certidão de nascimento", "certidao de nascimento", "nascimento"];
    case "certidao-de-casamento":
      return ["certidão de casamento", "certidao de casamento", "casamento"];
    case "certidao-de-obito":
      return ["certidão de óbito", "certidao de obito", "óbito", "obito"];
    case "certidao-negativa-de-testamento":
      return ["censec", "negativa de testamento", "testamento"];
    case "certidao-de-escritura-de-compra-e-venda":
      return ["escritura pública", "escritura publica", "escritura", "compra e venda"];
    case "consulta-de-inventario":
      return ["consulta de inventário", "consulta de inventario"];
    case "certidao-de-inventario":
      return ["certidão de inventário", "certidao de inventario"];
    case "pesquisa-de-imoveis":
      return ["pesquisa de imóveis", "pesquisa de imoveis"];
    case "pesquisa-de-protesto":
      return ["pesquisa de protesto"];
    case "certidao-de-matricula-de-imovel":
      return ["matrícula de imóvel", "matricula de imovel", "matrícula", "matricula"];
    case "certidao-de-protesto":
      return ["certidão de protesto", "certidao de protesto", "protesto"];
    case "trf-certidao-de-distribuicao-da-justica-federal":
      return ["trf", "justiça federal", "justica federal", "distribuição federal"];
    case "trt-certidao-de-acoes-trabalhistas-ceat":
      return ["trt", "ceat", "ações trabalhistas", "acoes trabalhistas"];
    case "ccir-certificado-cadastro-imovel-rural-incra":
      return ["ccir", "incra", "imóvel rural", "imovel rural"];
    case "certidao-de-divorcio":
      return ["certidão de divórcio", "certidao de divorcio", "divórcio", "divorcio"];
    case "certidao-de-interdicao":
      return ["certidão de interdição", "certidao de interdicao", "interdição", "interdicao"];
    case "certidao-de-procuracao":
      return ["procuração", "procuracao", "certidão de procuração"];
    case "busca-da-matricula-do-imovel":
      return ["busca da matrícula", "busca da matricula", "localizar matrícula"];
    case "certidao-negativa-de-onus-de-imovel":
      return ["negativa de ônus", "negativa de onus", "ônus reais", "onus reais"];
    case "certidao-negativa-de-propriedade-imovel":
      return ["negativa de propriedade", "não possui imóvel", "nao possui imovel"];
    default:
      return [];
  }
}

function resolveSlug(token: string): string | undefined {
  const normalized = token.trim().toLowerCase();
  const bySlug = getCertificateBySlug(normalized);
  if (bySlug) return bySlug.slug;

  const byId = MVP_CERTIFICATES.find((cert) => cert.id === normalized);
  return byId?.slug;
}

function mentionedSlugs(text: string): string[] {
  const haystack = text.toLowerCase();
  const found: string[] = [];

  for (const cert of MVP_CERTIFICATES) {
    const needles = [
      cert.name.toLowerCase(),
      cert.slug.replace(/-/g, " "),
      ...extraAliases(cert.slug),
    ];

    const matched = needles.some((needle) => needle.length >= 6 && haystack.includes(needle));
    if (matched) found.push(cert.slug);
  }

  return found;
}

export function extractAmandaProducts(
  rawReply: string,
  userQuestion?: string
): {
  text: string;
  products: AmandaProductLink[];
} {
  const marked = new Set<string>();
  let closed = false;

  const text = rawReply
    .replace(CLOSE_MARKER, () => {
      closed = true;
      return "";
    })
    .replace(PRODUCT_MARKER, (_, slug: string) => {
      const resolved = resolveSlug(slug);
      if (resolved) marked.add(resolved);
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (closed) {
    return { text, products: [] };
  }

  const asked = userQuestion ? mentionedSlugs(userQuestion) : [];
  let slugs: string[];

  if (asked.length === 1) {
    slugs = asked;
  } else if (asked.length > 1) {
    const overlap = asked.filter((slug) => marked.has(slug));
    slugs = overlap.length > 0 ? overlap : asked;
  } else {
    slugs = [...marked];
  }

  const products = slugs
    .map((slug) => getCertificateBySlug(slug))
    .filter((cert): cert is NonNullable<typeof cert> => Boolean(cert))
    .map((cert) => ({
      slug: cert.slug,
      name: cert.name,
      priceLabel: formatCurrency(startingPriceFor(cert)),
      estimatedDays: cert.estimatedDays,
    }));

  return { text, products };
}

export function splitAmandaReply(text: string, maxChars = 150): string[] {
  const cleaned = text.replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n\n+/)
    .flatMap((part) => part.split(/\n+/))
    .map((part) => part.trim())
    .filter(Boolean);

  const blocks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      blocks.push(paragraph);
      continue;
    }

    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let current = "";

    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length <= maxChars) {
        current = next;
        continue;
      }

      if (current) blocks.push(current);

      if (sentence.length <= maxChars) {
        current = sentence;
      } else {
        blocks.push(...chunkByWords(sentence, maxChars));
        current = "";
      }
    }

    if (current) blocks.push(current);
  }

  return blocks.slice(0, 3);
}

function chunkByWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function amandaTypingDelay(text: string): number {
  return Math.min(1300, Math.max(420, 320 + text.length * 16));
}

export function catalogProductHint(): string {
  return MVP_CERTIFICATES.map((cert) => `- ${cert.slug} → ${cert.name}`).join("\n");
}
