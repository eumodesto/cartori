import { BRAZIL_UFS } from "@/lib/ibge-uf";

/** Registro profissional exigido no cadastro de empresa (advocacia ou imobiliária). */
export type ProfessionalRegistryKind = "OAB" | "CRECI";

export const PROFESSIONAL_REGISTRY_LABEL: Record<ProfessionalRegistryKind, string> = {
  OAB: "Advocacia (OAB)",
  CRECI: "Imobiliária (CRECI)",
};

export function isProfessionalRegistryKind(value: unknown): value is ProfessionalRegistryKind {
  return value === "OAB" || value === "CRECI";
}

export function normalizeRegistryNumber(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z-]/g, "").slice(0, 12);
}

/** "OAB/SP 123456" ou "CRECI/SP 12345-J"; null se UF ou número forem inválidos. */
export function formatProfessionalRegistry(
  kind: ProfessionalRegistryKind,
  uf: string,
  number: string
): string | null {
  const state = uf.trim().toUpperCase();
  const digits = normalizeRegistryNumber(number);
  if (!BRAZIL_UFS.includes(state)) return null;
  if (!/^\d{1,8}(-?[A-Z])?$/.test(digits)) return null;
  return `${kind}/${state} ${digits}`;
}
