import {
  DossierPurpose,
  DossierStatus,
  IdentifierKind,
  SubjectKind,
} from "@prisma/client";
import { maskCpfCnpj } from "@/lib/utils";

export type { DossierPurpose, DossierStatus, IdentifierKind, SubjectKind };

export const DOSSIER_PURPOSES: { value: DossierPurpose; label: string }[] = [
  { value: "COMPRA_IMOVEL", label: "Compra ou venda de imóvel" },
  { value: "FINANCIAMENTO", label: "Financiamento" },
  { value: "INVENTARIO", label: "Inventário ou partilha" },
  { value: "DUE_DILIGENCE_SOCIETARIA", label: "Due diligence societária" },
  { value: "PROCESSO", label: "Processo judicial" },
  { value: "OUTRO", label: "Outra finalidade" },
];

export const SUBJECT_KINDS: { value: SubjectKind; label: string }[] = [
  { value: "PERSON", label: "Pessoa" },
  { value: "COMPANY", label: "Empresa" },
  { value: "URBAN_PROPERTY", label: "Imóvel urbano" },
  { value: "RURAL_PROPERTY", label: "Imóvel rural" },
  { value: "LAWSUIT", label: "Processo" },
];

export const IDENTIFIER_KINDS: { value: IdentifierKind; label: string }[] = [
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "MATRICULA", label: "Matrícula" },
  { value: "CAR", label: "CAR" },
  { value: "NIRF", label: "NIRF / CAFIR" },
  { value: "PROCESSO_CNJ", label: "Processo (CNJ)" },
  { value: "OTHER", label: "Outro" },
];

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  DRAFT: "Rascunho",
  RUNNING: "Em consulta",
  PARTIAL: "Parcial",
  READY: "Pronto para solicitar",
  EXPIRED: "Expirado",
  ARCHIVED: "Arquivado",
};

export function purposeLabel(purpose: DossierPurpose) {
  return DOSSIER_PURPOSES.find((item) => item.value === purpose)?.label || purpose;
}

export function subjectKindLabel(kind: SubjectKind) {
  return SUBJECT_KINDS.find((item) => item.value === kind)?.label || kind;
}

export function identifierKindLabel(kind: IdentifierKind) {
  return IDENTIFIER_KINDS.find((item) => item.value === kind)?.label || kind;
}

export function defaultIdentifierKind(kind: SubjectKind): IdentifierKind {
  if (kind === "PERSON") return "CPF";
  if (kind === "COMPANY") return "CNPJ";
  if (kind === "URBAN_PROPERTY") return "MATRICULA";
  if (kind === "RURAL_PROPERTY") return "CAR";
  return "PROCESSO_CNJ";
}

export function identifierPlaceholder(kind: IdentifierKind | string) {
  if (kind === "CPF") return "000.000.000-00";
  if (kind === "CNPJ") return "00.000.000/0000-00";
  if (kind === "MATRICULA") return "Número da matrícula";
  if (kind === "CAR") return "Código do CAR";
  if (kind === "NIRF") return "Número do NIRF";
  if (kind === "PROCESSO_CNJ") return "Número do processo (CNJ)";
  return "Identificador";
}

export function identifierHelper(kind: IdentifierKind | string) {
  if (kind === "CPF") return "11 dígitos. O CPF é conferido no servidor.";
  if (kind === "CNPJ") return "14 dígitos. O CNPJ é conferido no servidor.";
  return undefined;
}

export type PublicIdentifier = {
  id: string;
  kind: IdentifierKind;
  value: string;
};

export type PublicSubject = {
  id: string;
  kind: SubjectKind;
  displayName: string;
  notes: string | null;
  identifiers: PublicIdentifier[];
};

export type PublicDossier = {
  id: string;
  protocol: string;
  title: string;
  purpose: DossierPurpose;
  purposeNote: string | null;
  status: DossierStatus;
  createdAt: string;
  subjectCount: number;
  subjects: PublicSubject[];
};

export type PublicCertificateRecommendation = {
  slug: string;
  name: string;
  shortDescription: string;
  categoryName: string;
  estimatedDays: string;
  basePrice: number;
  reason: string;
  subjectId: string;
  subjectName: string;
};

export type PublicDossierSummary = Omit<PublicDossier, "subjects" | "purposeNote"> & {
  primarySubject: string | null;
};

const NAME_FIELDS = new Set([
  "nome",
  "nome_completo",
  "nome_pessoa",
  "nome_completo_registrado",
  "nome_do_falecido",
]);

export function documentDataFromSubject(
  fieldIds: string[],
  subject: PublicSubject
): Record<string, string> {
  const valueOf = (kind: IdentifierKind) =>
    subject.identifiers.find((row) => row.kind === kind)?.value || "";
  const cpf = valueOf("CPF");
  const cnpj = valueOf("CNPJ");
  const matricula = valueOf("MATRICULA");
  const car = valueOf("CAR");
  const data: Record<string, string> = {};

  for (const id of fieldIds) {
    if (id === "cpf" && cpf) data[id] = maskCpfCnpj(cpf);
    else if (id === "cnpj" && cnpj) data[id] = maskCpfCnpj(cnpj);
    else if (id === "numero_matricula" && matricula) data[id] = matricula;
    else if (id === "car" && car) data[id] = car;
    else if (NAME_FIELDS.has(id) && subject.displayName) data[id] = subject.displayName;
  }

  return data;
}
