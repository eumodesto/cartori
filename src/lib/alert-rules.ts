import type { DisplayOrderStatus } from "@/lib/order-status";

/** Caixa "Mensagens e alertas": tipos, textos e estado de lido. Puro: usado no servidor e nos testes. */

export type AlertKind =
  | "message"
  | "status"
  | "payment"
  | "document"
  | "order"
  | "stale"
  | "dossier"
  | "email"
  | "signup";

export type AlertTone = "info" | "success" | "warning" | "error";

/** customer = sobre os próprios pedidos; staff = fila da equipe InterJuri. */
export type AlertAudience = "customer" | "staff";

export type AccountAlert = {
  /** Estável: o mesmo fato gera sempre o mesmo id (é o que fica salvo como lido). */
  id: string;
  kind: AlertKind;
  audience: AlertAudience;
  tone: AlertTone;
  title: string;
  body: string;
  href: string;
  protocol?: string;
  createdAt: string;
  read: boolean;
};

export type UnreadAlert = Omit<AccountAlert, "read">;

export const ALERT_LIMIT = 40;
export const ALERT_ID_PATTERN = /^[a-z-]+:[A-Za-z0-9:._-]{1,160}$/;

/** Lido = anterior ao "marcar todos" ou marcado um a um. */
export function applyReadState(
  alerts: UnreadAlert[],
  seenAt: Date | null,
  readIds: ReadonlySet<string>
): AccountAlert[] {
  const seen = seenAt ? seenAt.getTime() : 0;
  return alerts.map((alert) => ({
    ...alert,
    read: Date.parse(alert.createdAt) <= seen || readIds.has(alert.id),
  }));
}

export function sortAndLimit<T extends { createdAt: string }>(alerts: T[], limit = ALERT_LIMIT) {
  return [...alerts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
}

/** Título e tom de uma mudança de status, conforme o status exibido ao cliente. */
export function statusAlertCopy(display: DisplayOrderStatus | null, audience: AlertAudience) {
  switch (display) {
    case "PAYMENT_APPROVED":
      return audience === "staff"
        ? { title: "Nova compra paga", tone: "success" as const }
        : { title: "Pagamento aprovado", tone: "success" as const };
    case "PAYMENT_REJECTED":
      return { title: "Pagamento recusado", tone: "error" as const };
    case "REFUNDED":
      return { title: "Compra estornada", tone: "warning" as const };
    case "WAITING_CUSTOMER":
      return audience === "staff"
        ? { title: "Aguardando o cliente", tone: "warning" as const }
        : { title: "A equipe precisa de você", tone: "warning" as const };
    case "DELIVERED":
      return { title: "Certidão entregue", tone: "success" as const };
    case "CANCELLED":
      return { title: "Pedido cancelado", tone: "warning" as const };
    default:
      return { title: "Status atualizado", tone: "info" as const };
  }
}

export function previewText(text: string, max = 140) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max - 1)}…`;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** PDF da certidão fica 30 dias no painel (Política de Privacidade); o lembrete aparece aos 23. */
export const RETENTION_DAYS = 30;
export const RETENTION_REMINDER_DAYS = 23;

/** Pedido pago sem movimento há mais que isso vira alerta para a equipe. */
export const STALE_PAID_DAYS = 2;
/** Cliente sem responder há mais que isso vira alerta para a equipe. */
export const STALE_CUSTOMER_DAYS = 5;

export function daysBetween(from: Date | string, to: Date = new Date()) {
  return Math.floor((to.getTime() - new Date(from).getTime()) / DAY_MS);
}
