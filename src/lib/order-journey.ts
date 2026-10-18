import type { DisplayOrderStatus } from "@/lib/order-status";

/**
 * O que o cliente lê em cada etapa do pedido e quanto falta. Puro: usado no servidor e na tela.
 * Prazos em dias úteis (seg–sex), sem contar feriados.
 */

export type JourneyDisplay = DisplayOrderStatus | "CANCEL_REQUESTED";

export type JourneyCopy = {
  title: string;
  text: string;
  tone: "info" | "success" | "warning" | "error" | "neutral";
};

/** Frase de cada status exibido ao cliente. A etapa interna detalha os status "em emissão". */
export function journeyCopy(display: JourneyDisplay, internalStatus?: string): JourneyCopy {
  switch (display) {
    case "PAYMENT_PENDING":
      return {
        title: "Aguardando pagamento",
        text: "Seu pedido está reservado. Assim que o pagamento for confirmado, começamos. PIX confirma em minutos; cartão, na hora.",
        tone: "warning",
      };
    case "PAYMENT_REJECTED":
      return {
        title: "Pagamento não aprovado",
        text: "O pagamento não foi aprovado. O pedido continua aberto: tente de novo por PIX ou com outro cartão.",
        tone: "error",
      };
    case "PAYMENT_APPROVED":
      return {
        title: "Pagamento confirmado",
        text: "Recebemos o pagamento. A equipe vai conferir os dados e enviar o pedido ao cartório.",
        tone: "success",
      };
    case "IN_ISSUANCE":
      if (internalStatus === "IN_CARTORIO_SEARCH") {
        return {
          title: "No cartório",
          text: "O pedido foi enviado ao cartório responsável, que faz a busca e emite a certidão. O prazo depende do cartório.",
          tone: "info",
        };
      }
      if (internalStatus === "SHIPPED") {
        return {
          title: "Enviada pelos Correios",
          text: "A via em papel foi postada pelo cartório. Acompanhe a entrega pelo código de rastreio.",
          tone: "info",
        };
      }
      return {
        title: "Conferindo os dados",
        text: "Estamos revisando as informações antes de pedir ao cartório. Se faltar algo, avisamos nas mensagens.",
        tone: "info",
      };
    case "WAITING_CUSTOMER":
      return {
        title: "Precisamos de você",
        text: "Falta uma informação ou documento. Responda nas mensagens ou envie em Documentos; o prazo fica pausado até a resposta.",
        tone: "warning",
      };
    case "DELIVERED":
      return internalStatus === "COMPLETED"
        ? { title: "Pedido concluído", text: "Tudo entregue. Guarde uma cópia da certidão.", tone: "success" }
        : {
            title: "Certidão emitida",
            text: "A certidão está pronta. Baixe o PDF em Documentos: ele fica disponível no painel por 30 dias.",
            tone: "success",
          };
    case "REFUNDED":
      return {
        title: "Compra estornada",
        text: "O valor foi estornado e o pedido, cancelado. O prazo para o dinheiro voltar depende do banco ou da operadora do cartão.",
        tone: "neutral",
      };
    case "CANCELLED":
      return { title: "Pedido cancelado", text: "Este pedido foi cancelado e não será emitido.", tone: "neutral" };
    case "CANCEL_REQUESTED":
      return {
        title: "Cancelamento solicitado",
        text: "Recebemos o seu pedido de cancelamento. O setor responsável vai analisar e confirmar por e-mail em até 2 dias úteis. Até lá, o pedido fica pausado.",
        tone: "warning",
      };
  }
}

/** Linha do tempo: em que passo o pedido está (0 a 4). */
export const JOURNEY_STEPS = ["Pagamento", "Conferência", "Cartório", "Emissão", "Entrega"] as const;

export function journeyStepIndex(internalStatus: string): number {
  switch (internalStatus) {
    case "DRAFT":
    case "PENDING_PAYMENT":
      return 0;
    case "PAID":
    case "IN_ANALYSIS":
    case "WAITING_CUSTOMER":
      return 1;
    case "IN_CARTORIO_SEARCH":
      return 2;
    case "CERTIFICATE_ISSUED":
      return 3;
    case "SHIPPED":
    case "COMPLETED":
      return 4;
    default:
      return 0;
  }
}

/** "3 a 6 dias úteis" → { min: 3, max: 6 }; "2 dias úteis" → { min: 2, max: 2 }. */
export function parseBusinessDays(text: string | null | undefined) {
  const numbers = String(text || "").match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) added += 1;
  }
  return date;
}

/** Dias úteis de `from` (exclusive) até `to` (inclusive); negativo se `to` já passou. */
export function businessDaysBetween(from: Date, to: Date) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  const sign = end >= start ? 1 : -1;
  const cursor = new Date(start);
  let count = 0;
  while (sign > 0 ? cursor < end : cursor > end) {
    cursor.setDate(cursor.getDate() + sign);
    if (!isWeekend(cursor)) count += sign;
  }
  return count;
}

export type JourneyDeadline =
  | { kind: "after_payment"; min: number; max: number }
  | { kind: "paused" }
  | { kind: "running"; dueAt: string; remaining: number }
  | { kind: "late"; dueAt: string }
  | { kind: "done" }
  | null;

const RUNNING = new Set(["PAID", "IN_ANALYSIS", "IN_CARTORIO_SEARCH"]);

/** Previsão a partir do pagamento e do maior prazo entre as certidões do pedido. */
export function journeyDeadline(input: {
  internalStatus: string;
  paidAt: Date | null;
  maxDays: { min: number; max: number } | null;
  cancelRequested?: boolean;
  now?: Date;
}): JourneyDeadline {
  const { internalStatus, paidAt, maxDays } = input;
  const now = input.now ?? new Date();
  if (["CERTIFICATE_ISSUED", "SHIPPED", "COMPLETED"].includes(internalStatus)) return { kind: "done" };
  if (internalStatus === "CANCELLED") return null;
  if (!maxDays) return null;
  if (!paidAt) return { kind: "after_payment", ...maxDays };
  if (internalStatus === "WAITING_CUSTOMER" || input.cancelRequested) return { kind: "paused" };
  if (!RUNNING.has(internalStatus)) return null;
  const due = addBusinessDays(paidAt, maxDays.max);
  const remaining = businessDaysBetween(now, due);
  return remaining >= 0
    ? { kind: "running", dueAt: due.toISOString(), remaining }
    : { kind: "late", dueAt: due.toISOString() };
}

export function deadlineText(deadline: JourneyDeadline) {
  if (!deadline) return null;
  const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  switch (deadline.kind) {
    case "after_payment":
      return `Prazo estimado: ${deadline.min === deadline.max ? deadline.max : `${deadline.min} a ${deadline.max}`} dias úteis, contados a partir do pagamento.`;
    case "paused":
      return "Prazo pausado até a resposta.";
    case "running":
      return deadline.remaining === 0
        ? `Previsão de entrega: hoje (${day(deadline.dueAt)}).`
        : `Previsão de entrega: até ${day(deadline.dueAt)} · falta${deadline.remaining > 1 ? "m" : ""} ${deadline.remaining} ${deadline.remaining > 1 ? "dias úteis" : "dia útil"}.`;
    case "late":
      return `A previsão era ${day(deadline.dueAt)}. O cartório ainda não concluiu; seguimos acompanhando e avisamos aqui.`;
    case "done":
      return "Prazo cumprido.";
  }
}
