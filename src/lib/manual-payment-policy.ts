export const MANUAL_PAYMENT_PROVIDER = "MANUAL";

export const MANUAL_PAYMENT_ACTIONS = ["PAYMENT_APPROVED", "PAYMENT_REJECTED", "REFUNDED"] as const;
export type ManualPaymentAction = (typeof MANUAL_PAYMENT_ACTIONS)[number];

export const MANUAL_REASON_MIN = 10;
export const MANUAL_REASON_MAX = 500;

const AWAITING_PAYMENT = ["DRAFT", "PENDING_PAYMENT"];

export function isManualPaymentAction(value: unknown): value is ManualPaymentAction {
  return typeof value === "string" && (MANUAL_PAYMENT_ACTIONS as readonly string[]).includes(value);
}

export function sanitizeManualReason(raw: unknown) {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, MANUAL_REASON_MAX);
}

/** Ações manuais de pagamento possíveis para o estado atual do pedido. */
export function manualPaymentActions(order: {
  status: string;
  payments: { status: string }[];
}): ManualPaymentAction[] {
  const approved = order.payments.some((payment) => payment.status === "APPROVED");
  if (AWAITING_PAYMENT.includes(order.status) && !approved) {
    return ["PAYMENT_APPROVED", "PAYMENT_REJECTED"];
  }
  // Inclui pedido pago que a mesa já cancelou: o dinheiro entrou e o estorno precisa ficar registrado.
  if (approved) return ["REFUNDED"];
  return [];
}
