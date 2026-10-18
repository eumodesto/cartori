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

/** Status oficial mostrado ao cliente e no admin. As etapas internas da mesa continuam no OrderStatus. */
export type DisplayOrderStatus =
  | "PAYMENT_PENDING"
  | "PAYMENT_REJECTED"
  | "PAYMENT_APPROVED"
  | "IN_ISSUANCE"
  | "WAITING_CUSTOMER"
  | "DELIVERED"
  | "REFUNDED"
  | "CANCELLED";

export const DISPLAY_STATUS_META: Record<DisplayOrderStatus, { label: string; semantic: StatusType }> = {
  PAYMENT_PENDING: { label: "Pagamento Pendente", semantic: "warning" },
  PAYMENT_REJECTED: { label: "Pagamento Recusado", semantic: "error" },
  PAYMENT_APPROVED: { label: "Pagamento Realizado", semantic: "success" },
  IN_ISSUANCE: { label: "Documento em Emissão", semantic: "info" },
  WAITING_CUSTOMER: { label: "Aguardando Cliente", semantic: "warning" },
  DELIVERED: { label: "Documento Entregue", semantic: "success" },
  REFUNDED: { label: "Compra Estornada", semantic: "neutral" },
  CANCELLED: { label: "Pedido Cancelado", semantic: "neutral" },
};

const DISPLAY_BY_ORDER_STATUS: Record<string, DisplayOrderStatus> = {
  DRAFT: "PAYMENT_PENDING",
  PENDING_PAYMENT: "PAYMENT_PENDING",
  PAID: "PAYMENT_APPROVED",
  IN_ANALYSIS: "IN_ISSUANCE",
  IN_CARTORIO_SEARCH: "IN_ISSUANCE",
  WAITING_CUSTOMER: "WAITING_CUSTOMER",
  CERTIFICATE_ISSUED: "DELIVERED",
  SHIPPED: "DELIVERED",
  COMPLETED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

/** Etapa interna da mesa operacional (detalhe que o cliente não vê). */
const ORDER_STEP_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  IN_ANALYSIS: "Em análise",
  IN_CARTORIO_SEARCH: "Busca no cartório",
  WAITING_CUSTOMER: "Ação do cliente",
  CERTIFICATE_ISSUED: "Certidão emitida",
  SHIPPED: "Enviada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

/**
 * `paymentStatus` é o do pagamento mais recente. Estorno vence qualquer etapa;
 * recusa só aparece enquanto o pedido ainda espera pagamento.
 */
/** Selo exibido enquanto há pedido de cancelamento em análise (sobrepõe o status do pedido). */
export const CANCEL_REQUESTED_META: { label: string; semantic: StatusType } = {
  label: "Cancelamento solicitado",
  semantic: "warning",
};

export function displayOrderStatus(status: string, paymentStatus?: string | null): DisplayOrderStatus {
  if (paymentStatus === "REFUNDED") return "REFUNDED";
  if (status === "DRAFT" || status === "PENDING_PAYMENT") {
    if (paymentStatus === "APPROVED") return "PAYMENT_APPROVED";
    if (paymentStatus === "REJECTED" || paymentStatus === "CANCELLED") return "PAYMENT_REJECTED";
  }
  return DISPLAY_BY_ORDER_STATUS[status] ?? "PAYMENT_PENDING";
}

export function displayStatusMeta(status: string, paymentStatus?: string | null) {
  return DISPLAY_STATUS_META[displayOrderStatus(status, paymentStatus)];
}

/** Rótulo oficial a partir só da etapa interna (e-mails e alertas de mudança de etapa). */
export function orderStatusMeta(status: string) {
  const display = DISPLAY_BY_ORDER_STATUS[status];
  return display
    ? DISPLAY_STATUS_META[display]
    : { label: status, semantic: "neutral" as StatusType };
}

export function orderStepLabel(status: string) {
  return ORDER_STEP_LABEL[status] || status;
}

/** Rótulo para a mesa: status oficial com a etapa interna quando ela agrupa mais de uma. */
export function staffStatusLabel(status: string) {
  const official = orderStatusMeta(status).label;
  const step = orderStepLabel(status);
  return official === step ? official : `${official} · ${step}`;
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

/** Pedido com pagamento confirmado pelo servidor. Cancelado ou estornado nunca conta como compra. */
export function isOrderPaid(order: Pick<PublicOrder, "status" | "payment"> | null | undefined) {
  if (!order || order.status === "CANCELLED" || order.payment?.status === "REFUNDED") return false;
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
  label: staffStatusLabel(value),
}));
