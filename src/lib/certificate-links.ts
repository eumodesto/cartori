import { MVP_CERTIFICATES, getCertificateBySlug } from "@/lib/catalog";

export const CERTIFICATE_QUERY_KEY = "certidao";

/** Atalhos estáveis para anúncios e rodapé. Só apontam a slugs já existentes no catálogo. */
const CERTIFICATE_ALIASES: Record<string, string> = {
  nascimento: "certidao-de-nascimento",
  casamento: "certidao-de-casamento",
  obito: "certidao-de-obito",
  divorcio: "certidao-de-divorcio",
  interdicao: "certidao-de-interdicao",
  testamento: "certidao-negativa-de-testamento",
  censec: "certidao-negativa-de-testamento",
  "negativa-de-testamento": "certidao-negativa-de-testamento",
  matricula: "certidao-de-matricula-de-imovel",
  "matricula-de-imovel": "certidao-de-matricula-de-imovel",
  protesto: "certidao-de-protesto",
};

export const FOOTER_CERTIFICATE_LINKS = [
  { title: "Nascimento", slug: "certidao-de-nascimento" },
  { title: "Casamento", slug: "certidao-de-casamento" },
  { title: "Óbito", slug: "certidao-de-obito" },
  { title: "Negativa de Testamento", slug: "certidao-negativa-de-testamento" },
  { title: "Matrícula de Imóvel", slug: "certidao-de-matricula-de-imovel" },
  { title: "Protesto", slug: "certidao-de-protesto" },
] as const;

function normalizeToken(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function firstSearchParam(
  value: string | string[] | undefined | null
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function resolveCertificateSlug(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const token = normalizeToken(raw);
  if (!token) return null;

  const bySlug = getCertificateBySlug(token);
  if (bySlug) return bySlug.slug;

  const byId = MVP_CERTIFICATES.find((cert) => cert.id === token);
  if (byId) return byId.slug;

  const alias = CERTIFICATE_ALIASES[token];
  if (alias) return alias;

  return null;
}

export function certificateFromParam(raw: string | null | undefined) {
  const slug = resolveCertificateSlug(raw);
  if (!slug) return null;
  return getCertificateBySlug(slug) ?? null;
}

/** Slug canônico a partir de /certidao/[slug], ?certidao= ou ?servico=. */
export function certificateSlugFromLocation(
  pathname: string,
  search: URLSearchParams | { get(name: string): string | null }
) {
  const fromPath = pathname.startsWith("/certidao/")
    ? pathname.split("/").filter(Boolean)[1]
    : null;
  return resolveCertificateSlug(
    fromPath || search.get(CERTIFICATE_QUERY_KEY) || search.get("servico")
  );
}

export function certificatePath(slug: string) {
  const canonical = resolveCertificateSlug(slug) || slug;
  return `/certidao/${canonical}`;
}

export function certificateQueryPath(slug: string) {
  const canonical = resolveCertificateSlug(slug) || slug;
  return `/?${CERTIFICATE_QUERY_KEY}=${encodeURIComponent(canonical)}`;
}

export function listCertificatePathParams() {
  const slugs = new Set<string>();
  for (const cert of MVP_CERTIFICATES) slugs.add(cert.slug);
  for (const alias of Object.keys(CERTIFICATE_ALIASES)) slugs.add(alias);
  for (const cert of MVP_CERTIFICATES) slugs.add(cert.id);
  return [...slugs].map((slug) => ({ slug }));
}
