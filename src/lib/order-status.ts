import type { StatusType } from "@/components/ui/status-badge";

export type PublicOrderItem = {
  id: string;
  certificateName: string;
  state: string;
  city: string;
  totalPrice: number;
};

export type PublicOrderPayment = {
  status: string;
  amount: number;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  method?: "PIX" | "CREDIT_CARD";
} | null;

export type PublicOrder = {
  id: string;
  protocol: string;
  status: string;
  totalAmount: number;
  items: PublicOrderItem[];
  payment: PublicOrderPayment;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; semantic: StatusType }> = {
  PENDING_PAYMENT: { label: "Aguardando pagamento", semantic: "warning" },
  PAID: { label: "Pago", semantic: "success" },
  IN_ANALYSIS: { label: "Em análise", semantic: "info" },
  IN_CARTORIO_SEARCH: { label: "Busca no cartório", semantic: "info" },
  CERTIFICATE_ISSUED: { label: "Certidão emitida", semantic: "success" },
  SHIPPED: { label: "Enviada", semantic: "info" },
  COMPLETED: { label: "Concluída", semantic: "success" },
  CANCELLED: { label: "Cancelada", semantic: "neutral" },
};

export function orderStatusMeta(status: string) {
  return STATUS_MAP[status] || { label: status, semantic: "neutral" as StatusType };
}

export function livePixCode(qrCode?: string) {
  if (!qrCode) return "";
  if (/^CARTORI-.+-DEMO$/i.test(qrCode)) return "";
  return qrCode;
}
