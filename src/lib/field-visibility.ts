import { CertificateFormat, FormFieldDefinition, FormFieldVisibility } from "@/lib/types";

export function visibilityRules(field: FormFieldDefinition): FormFieldVisibility[] {
  if (!field.visibleWhen) return [];
  return Array.isArray(field.visibleWhen) ? field.visibleWhen : [field.visibleWhen];
}

export function isFieldVisible(
  field: FormFieldDefinition,
  ctx: {
    documentData: Record<string, string>;
    format?: CertificateFormat | string;
    uf?: string;
  }
): boolean {
  for (const rule of visibilityRules(field)) {
    const current =
      rule.field === "_format"
        ? String(ctx.format || "")
        : rule.field === "_uf"
          ? String(ctx.uf || "").toUpperCase()
          : String(ctx.documentData[rule.field] || "");

    if (rule.in) {
      if (!current) return false;
      if (!rule.in.includes(current)) return false;
    }
    if (rule.notIn && current && rule.notIn.includes(current)) return false;
  }
  return true;
}

const PRICED_ADDON = /^(averbacao|inteiro_teor|traducao|apostilamento)/i;

export function isPricedAddonField(field: FormFieldDefinition): boolean {
  return PRICED_ADDON.test(field.id);
}

export function lookupPricedAmount(
  priced: { price?: number; priceByUf?: Record<string, number> } | undefined,
  uf?: string
): number {
  if (!priced) return 0;
  const sigla = (uf || "").toUpperCase();
  const byUf = priced.priceByUf;
  if (byUf && Object.keys(byUf).length) {
    if (sigla && byUf[sigla] != null) return byUf[sigla];
    if (sigla) return 0;
  }
  return priced.price || 0;
}

export function isPricedOptionAvailable(
  option: { price?: number; priceByUf?: Record<string, number> },
  uf?: string
): boolean {
  const byUf = option.priceByUf;
  if (!byUf || !Object.keys(byUf).length) return true;
  const sigla = (uf || "").toUpperCase();
  if (!sigla) return true;
  return byUf[sigla] != null;
}

export function extrasFromDocument(
  fields: FormFieldDefinition[],
  documentData: Record<string, string>,
  ctx: {
    format?: CertificateFormat | string;
    uf?: string;
    inteiroTeor?: boolean;
    shared?: boolean;
  }
): number {
  const includeInteiroTeor = ctx.inteiroTeor !== false;
  const includeShared = ctx.shared !== false;
  let extra = 0;
  for (const field of fields) {
    if (!isPricedAddonField(field)) continue;
    if (!isFieldVisible(field, { documentData, ...ctx })) continue;
    const val = String(documentData[field.id] || "");
    if (field.id === "inteiro_teor") {
      if (!includeInteiroTeor) continue;
    } else if (!includeShared) {
      continue;
    }
    if (field.type === "checkbox") {
      if (val === "true") extra += lookupPricedAmount(field, ctx.uf);
      continue;
    }
    if (!val || val === "nao") continue;
    if (field.id === "inteiro_teor") {
      const issuances =
        val === "inteiro_teor_ambas"
          ? ["inteiro_teor", "inteiro_teor_reprografica"]
          : [val];
      for (const issuance of issuances) {
        const option = field.options?.find((item) => item.value === issuance);
        if (option) extra += lookupPricedAmount(option, ctx.uf);
      }
      continue;
    }
    const option = field.options?.find((item) => item.value === val);
    if (!option) continue;
    extra += lookupPricedAmount(option, ctx.uf);
  }
  return extra;
}

const REGISTRY_NUMBER_IDS = new Set([
  "numero_termo",
  "numero_livro",
  "numero_folha",
  "numero_folhe",
]);

function documentFieldGroup(field: FormFieldDefinition): number {
  if (REGISTRY_NUMBER_IDS.has(field.id)) return 1;
  if (field.type === "date" || field.id.startsWith("data-") || field.id.startsWith("nome")) {
    return 0;
  }
  return 2;
}

/** Nomes e datas primeiro; termo, livro e folha em seguida; demais campos depois. */
export function sortDocumentFields(fields: FormFieldDefinition[]): FormFieldDefinition[] {
  return fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => documentFieldGroup(a.field) - documentFieldGroup(b.field) || a.index - b.index)
    .map((item) => item.field);
}
