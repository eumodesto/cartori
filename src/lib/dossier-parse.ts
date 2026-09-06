import { digitsOnly } from "@/lib/utils";
import { isValidCnpj, isValidCpf } from "@/lib/validators";
import {
  IdentifierKind,
  SubjectKind,
} from "@prisma/client";

export type IdentifierInput = {
  kind: IdentifierKind;
  value: string;
};

export type SubjectInput = {
  kind: SubjectKind;
  displayName: string;
  notes?: string | null;
  identifiers: IdentifierInput[];
};

function normalizeIdentifier(kind: IdentifierKind, raw: string): string {
  const trimmed = raw.trim();
  if (kind === "CPF" || kind === "CNPJ" || kind === "NIRF" || kind === "PROCESSO_CNJ") {
    return digitsOnly(trimmed);
  }
  if (kind === "CAR") {
    return trimmed.toUpperCase().replace(/\s+/g, "");
  }
  return trimmed;
}

export function identifierFieldError(kind: IdentifierKind, value: string): string | null {
  if (!value) return "Informe o identificador.";
  if (kind === "CPF") {
    return isValidCpf(value) ? null : "CPF inválido.";
  }
  if (kind === "CNPJ") {
    return isValidCnpj(value) ? null : "CNPJ inválido.";
  }
  if (kind === "MATRICULA") {
    return value.length >= 1 && value.length <= 40 ? null : "Matrícula inválida.";
  }
  if (kind === "CAR") {
    return value.length >= 4 && value.length <= 32 ? null : "CAR inválido.";
  }
  if (kind === "NIRF") {
    return value.length >= 5 && value.length <= 14 ? null : "NIRF inválido.";
  }
  if (kind === "PROCESSO_CNJ") {
    return value.length >= 12 && value.length <= 20 ? null : "Número de processo inválido.";
  }
  return value.length <= 80 ? null : "Identificador longo demais.";
}

function requiredKinds(kind: SubjectKind): IdentifierKind[] {
  if (kind === "PERSON") return ["CPF"];
  if (kind === "COMPANY") return ["CNPJ"];
  if (kind === "URBAN_PROPERTY") return ["MATRICULA"];
  if (kind === "RURAL_PROPERTY") return ["CAR", "NIRF"];
  return ["PROCESSO_CNJ"];
}

export function parseSubjectInput(raw: unknown): SubjectInput | string {
  if (!raw || typeof raw !== "object") return "Sujeito inválido.";
  const body = raw as Record<string, unknown>;
  const kind = body.kind as SubjectKind;
  const allowed: SubjectKind[] = [
    "PERSON",
    "COMPANY",
    "URBAN_PROPERTY",
    "RURAL_PROPERTY",
    "LAWSUIT",
  ];
  if (!allowed.includes(kind)) return "Tipo de sujeito inválido.";

  const displayName = String(body.displayName || "").trim();
  if (!displayName) return "Informe o nome do sujeito.";
  if (displayName.length > 180) return "Nome do sujeito longo demais.";

  const notesRaw = body.notes == null ? null : String(body.notes).trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  if (!Array.isArray(body.identifiers) || body.identifiers.length === 0) {
    return "Informe ao menos um identificador.";
  }

  const identifiers: IdentifierInput[] = [];
  const seen = new Set<string>();
  for (const item of body.identifiers) {
    if (!item || typeof item !== "object") return "Identificador inválido.";
    const row = item as Record<string, unknown>;
    const idKind = row.kind as IdentifierKind;
    const idAllowed: IdentifierKind[] = [
      "CPF",
      "CNPJ",
      "MATRICULA",
      "CAR",
      "NIRF",
      "PROCESSO_CNJ",
      "OTHER",
    ];
    if (!idAllowed.includes(idKind)) return "Tipo de identificador inválido.";
    const value = normalizeIdentifier(idKind, String(row.value || ""));
    const error = identifierFieldError(idKind, value);
    if (error) return error;
    const key = `${idKind}:${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    identifiers.push({ kind: idKind, value });
  }

  const required = requiredKinds(kind);
  const hasRequired = required.some((need) =>
    identifiers.some((row) => row.kind === need)
  );
  if (!hasRequired) {
    if (kind === "RURAL_PROPERTY") return "Informe o CAR ou o NIRF do imóvel rural.";
    if (kind === "PERSON") return "Informe o CPF da pessoa.";
    if (kind === "COMPANY") return "Informe o CNPJ da empresa.";
    if (kind === "URBAN_PROPERTY") return "Informe a matrícula do imóvel.";
    return "Informe o número do processo.";
  }

  return { kind, displayName, notes, identifiers };
}

export function parseSubjectsInput(raw: unknown): SubjectInput[] | string {
  if (!Array.isArray(raw) || raw.length === 0) {
    return "Inclua ao menos um sujeito na análise.";
  }
  if (raw.length > 12) return "Limite de 12 sujeitos por dossiê nesta etapa.";
  const subjects: SubjectInput[] = [];
  for (const item of raw) {
    const parsed = parseSubjectInput(item);
    if (typeof parsed === "string") return parsed;
    subjects.push(parsed);
  }
  return subjects;
}
