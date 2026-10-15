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
  WAITING_CUSTOMER: { label: "Ação do cliente", semantic: "warning" },
  CERTIFICATE_ISSUED: { label: "Certidão emitida", semantic: "success" },
  SHIPPED: { label: "Enviada", semantic: "info" },
  COMPLETED: { label: "Concluída", semantic: "success" },
  CANCELLED: { label: "Cancelada", semantic: "neutral" },
};

export function orderStatusMeta(status: string) {
  return STATUS_MAP[status] || { label: status, semantic: "neutral" as StatusType };
}

// Mesmo conjunto de POST_PAYMENT_STATUSES (authorization-policy): status que só existem após pagamento.
const SETTLED_STATUSES = new Set([
  "PAID",
  "IN_ANALYSIS",
  "IN_CARTORIO_SEARCH",
  "CERTIFICATE_ISSUED",
  "SHIPPED",
  "COMPLETED",
]);

/** Pedido com pagamento confirmado pelo servidor. Cancelado nunca conta como compra. */
export function isOrderPaid(order: Pick<PublicOrder, "status" | "payment"> | null | undefined) {
  if (!order || order.status === "CANCELLED") return false;
  return SETTLED_STATUSES.has(order.status) || order.payment?.status === "APPROVED";
}

export function livePixCode(qrCode?: string) {
  if (!qrCode) return "";
  if (/^CARTORI-.+-DEMO$/i.test(qrCode)) return "";
  return qrCode;
}

export const STAFF_STATUS_OPTIONS = [
  "IN_ANALYSIS",
  "IN_CARTORIO_SEARCH",
  "WAITING_CUSTOMER",
  "CERTIFICATE_ISSUED",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
].map((value) => ({
  value,
  label: orderStatusMeta(value).label,
}));
