import type { CaseAttachmentKind, CaseAuthorKind, OrderStatus } from "@prisma/client";

export const CASE_ATTACHMENT_KINDS: { value: CaseAttachmentKind; label: string }[] = [
  { value: "RG", label: "RG" },
  { value: "CNH", label: "CNH" },
  { value: "CERTIDAO", label: "Certidão" },
  { value: "COMPROVANTE", label: "Comprovante" },
  { value: "RESIDENCIA", label: "Comprovante de residência" },
  { value: "OTHER", label: "Outro documento" },
];

export const CASE_ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const CASE_MAX_FILE_BYTES = 15 * 1024 * 1024;
export const CASE_MESSAGE_MAX = 4000;

export type PublicCaseMessage = {
  id: string;
  authorKind: CaseAuthorKind;
  body: string;
  createdAt: string;
};

export type PublicCaseAttachment = {
  id: string;
  kind: CaseAttachmentKind;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type PublicCaseEvent = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
};

export type PublicOrderCase = {
  order: {
    id: string;
    protocol: string;
    status: OrderStatus;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    items: { certificateName: string; city: string; state: string }[];
  };
  messages: PublicCaseMessage[];
  attachments: PublicCaseAttachment[];
  events: PublicCaseEvent[];
};

export function sanitizeCaseBody(raw: unknown) {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.slice(0, CASE_MESSAGE_MAX);
}

export function isAllowedCaseMime(mime: string) {
  return (CASE_ALLOWED_MIME as readonly string[]).includes(mime);
}

export function safeUploadName(name: string) {
  const base = name.split(/[/\\]/).pop() || "arquivo";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  return cleaned || "arquivo";
}
