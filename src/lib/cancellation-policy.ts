import type { JourneyDeadline } from "@/lib/order-journey";

/**
 * Política de cancelamento e estorno (puro). Regras:
 * - Sem pagamento: cancela na hora, sem custo (se houver PIX recente, espera ele expirar).
 * - Pago: o cliente pede; vale até 7 dias corridos após a confirmação do pagamento e antes da
 *   emissão da certidão. A taxa de serviço de R$ 60,00 fica retida; o restante é estornado.
 * - Só um pedido de cancelamento em análise por vez; o setor responsável confirma ou recusa.
 */

export const CANCEL_SERVICE_FEE = 60;
export const CANCEL_WINDOW_DAYS = 7;
export const CANCEL_REASON_MIN = 5;
export const CANCEL_REASON_MAX = 500;
/** PIX expira em 30 min; folga de 1 h antes de cancelar um pedido com PIX gerado. */
export const PENDING_PIX_GRACE_MS = 60 * 60 * 1000;

const ISSUED = new Set(["CERTIFICATE_ISSUED", "SHIPPED", "COMPLETED"]);

export type CancellationOption =
  | { kind: "none"; reason: string | null }
  | { kind: "cancel_unpaid"; allowed: boolean; reason: string | null }
  | {
      kind: "refund";
      allowed: boolean;
      reason: string | null;
      fee: number;
      refundAmount: number;
      deadline: string;
    };

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function cancellationOption(input: {
  status: string;
  payments: Array<{ status: string; createdAt: Date | string }>;
  paidAt: Date | null;
  total: number;
  hasPendingRequest: boolean;
  now?: Date;
}): CancellationOption {
  const now = input.now ?? new Date();
  if (input.hasPendingRequest) return { kind: "none", reason: "Cancelamento já solicitado, em análise." };
  if (input.status === "CANCELLED") return { kind: "none", reason: null };
  if (input.payments.some((p) => p.status === "REFUNDED")) return { kind: "none", reason: null };

  const approved = input.payments.some((p) => p.status === "APPROVED");
  if (!approved && (input.status === "PENDING_PAYMENT" || input.status === "DRAFT")) {
    const recentPix = input.payments.some(
      (p) => (p.status === "PENDING" || p.status === "IN_PROCESS") && now.getTime() - new Date(p.createdAt).getTime() < PENDING_PIX_GRACE_MS
    );
    return {
      kind: "cancel_unpaid",
      allowed: !recentPix,
      reason: recentPix
        ? "Há um pagamento em andamento. Espere alguns minutos (o PIX expira em 30 minutos) para cancelar."
        : null,
    };
  }

  if (!approved || !input.paidAt) return { kind: "none", reason: null };

  const deadline = new Date(input.paidAt.getTime() + CANCEL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const fee = Math.min(CANCEL_SERVICE_FEE, input.total);
  const refundAmount = Math.max(0, Math.round((input.total - fee) * 100) / 100);
  const base = { kind: "refund" as const, fee, refundAmount, deadline: deadline.toISOString() };

  if (ISSUED.has(input.status)) {
    return { ...base, allowed: false, reason: "A certidão já foi emitida: o serviço foi concluído e não cabe cancelamento." };
  }
  if (now.getTime() > deadline.getTime()) {
    return {
      ...base,
      allowed: false,
      reason: `O prazo de ${CANCEL_WINDOW_DAYS} dias para cancelar terminou em ${deadline.toLocaleDateString("pt-BR")}.`,
    };
  }
  return { ...base, allowed: true, reason: null };
}

/** Texto da política exibido no popup e nos e-mails. */
export function cancellationPolicyLines(total: number) {
  const fee = Math.min(CANCEL_SERVICE_FEE, total);
  return [
    `Você pode cancelar em até ${CANCEL_WINDOW_DAYS} dias corridos após a confirmação do pagamento, enquanto a certidão não tiver sido emitida.`,
    `A taxa de serviço de ${money(CANCEL_SERVICE_FEE)} fica retida, porque o pedido já foi preparado pela equipe. O restante (${money(Math.max(0, total - fee))}) é estornado.`,
    "O estorno sai no mesmo meio de pagamento. No PIX, o valor volta para a conta de origem; no cartão, o prazo depende da operadora (pode aparecer na fatura seguinte).",
    "O pedido fica pausado enquanto o setor responsável analisa. A confirmação chega por e-mail em até 2 dias úteis.",
    "Pedido ainda não pago pode ser cancelado na hora, sem custo.",
  ];
}

export function sanitizeCancelReason(raw: unknown) {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, CANCEL_REASON_MAX);
}

export type PublicCancellationRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  feeAmount: number;
  refundAmount: number;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type OrderJourney = {
  paidAt: string | null;
  total: number;
  deadline: JourneyDeadline;
  cancellation: CancellationOption;
  request: PublicCancellationRequest | null;
};
