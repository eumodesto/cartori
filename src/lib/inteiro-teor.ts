import { FormFieldDefinition, FormFieldOption } from "@/lib/types";
import { isPricedOptionAvailable } from "@/lib/field-visibility";

export const INTEIRO_TEOR_TRANSCRITA = "inteiro_teor";
export const INTEIRO_TEOR_REPROGRAFICA = "inteiro_teor_reprografica";
export const INTEIRO_TEOR_AMBAS = "inteiro_teor_ambas";

export const INTEIRO_TEOR_BOTH_EXPLANATION =
  "Você receberá duas certidões do mesmo registro: uma certidão de inteiro teor transcrita e uma certidão de inteiro teor por cópia reprográfica.";

export function isInteiroTeorBoth(value?: string): boolean {
  return String(value || "") === INTEIRO_TEOR_AMBAS;
}

export function inteiroTeorOptionKind(
  option: FormFieldOption
): "transcrita" | "reprografica" | "other" {
  if (option.value === INTEIRO_TEOR_REPROGRAFICA || /reprografica/i.test(option.value + option.label)) {
    return "reprografica";
  }
  if (option.value === INTEIRO_TEOR_TRANSCRITA || option.value === "inteiro_teor") {
    return "transcrita";
  }
  return "other";
}

export function inteiroTeorSuffix(value?: string): string {
  if (value === INTEIRO_TEOR_REPROGRAFICA) return "inteiro teor — reprográfica";
  if (value === INTEIRO_TEOR_TRANSCRITA) return "inteiro teor — transcrita";
  return "";
}

export function certificateNameWithInteiroTeor(baseName: string, value?: string): string {
  const suffix = inteiroTeorSuffix(value);
  return suffix ? `${baseName} — ${suffix}` : baseName;
}

export function inteiroTeorIssuanceValues(value?: string): string[] {
  const current = String(value || "");
  if (!current || current === "nao") return [];
  if (current === INTEIRO_TEOR_AMBAS) {
    return [INTEIRO_TEOR_TRANSCRITA, INTEIRO_TEOR_REPROGRAFICA];
  }
  return [current];
}

export function findInteiroTeorOption(
  field: FormFieldDefinition,
  kind: "transcrita" | "reprografica"
) {
  return (field.options || []).find((option) => inteiroTeorOptionKind(option) === kind);
}

export function bothInteiroTeorAvailable(field: FormFieldDefinition, uf?: string): boolean {
  const transcrita = findInteiroTeorOption(field, "transcrita");
  const reprografica = findInteiroTeorOption(field, "reprografica");
  if (!transcrita || !reprografica) return false;
  return (
    isPricedOptionAvailable(transcrita, uf) && isPricedOptionAvailable(reprografica, uf)
  );
}

export function inteiroTeorRadioOptions(
  field: FormFieldDefinition,
  uf: string | undefined,
  extraSuffix: (priced?: FormFieldOption) => string
): Array<FormFieldOption & { description?: string }> {
  const transcrita = findInteiroTeorOption(field, "transcrita");
  const reprografica = findInteiroTeorOption(field, "reprografica");
  const options: Array<FormFieldOption & { description?: string }> = [];

  if (transcrita && isPricedOptionAvailable(transcrita, uf)) {
    options.push({
      ...transcrita,
      value: INTEIRO_TEOR_TRANSCRITA,
      label: `Inteiro teor — transcrita${extraSuffix(transcrita)}`,
    });
  }
  if (reprografica && isPricedOptionAvailable(reprografica, uf)) {
    options.push({
      ...reprografica,
      value: INTEIRO_TEOR_REPROGRAFICA,
      label: `Inteiro teor — reprográfica${extraSuffix(reprografica)}`,
    });
  }

  if (transcrita && reprografica && bothInteiroTeorAvailable(field, uf)) {
    options.push({
      value: INTEIRO_TEOR_AMBAS,
      label: "Quero as duas versões",
      description: "Duas certidões do mesmo registro, cobradas em separado.",
    });
  }

  return options;
}
