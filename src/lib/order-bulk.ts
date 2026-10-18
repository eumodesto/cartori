/** Ações em massa da mesa operacional. Regras puras: valem no servidor e na tela. */
import { formatCsvDate, toCsv } from "@/lib/csv";

export const BULK_ORDER_LIMIT = 100;
export const DELETE_CONFIRM_WORD = "EXCLUIR";

/** Só some de vez o pedido que nunca virou compra. */
export const DELETABLE_ORDER_STATUSES = ["DRAFT", "PENDING_PAYMENT", "CANCELLED"] as const;

/** Pagamento aprovado, em análise ou estornado é registro financeiro: o pedido fica. */
export const PAYMENT_STATUSES_BLOCKING_DELETE = ["APPROVED", "IN_PROCESS", "REFUNDED"] as const;

/** O PIX expira em 30 min; uma hora de folga cobre pagamento feito no limite. */
export const PENDING_PAYMENT_GRACE_MS = 60 * 60 * 1000;

export type DeletionPayment = { status: string; createdAt: Date | string };

export function canDeleteOrder(
  status: string,
  payments: DeletionPayment[],
  now: number = Date.now()
): boolean {
  if (!(DELETABLE_ORDER_STATUSES as readonly string[]).includes(status)) return false;
  return payments.every((payment) => {
    if ((PAYMENT_STATUSES_BLOCKING_DELETE as readonly string[]).includes(payment.status)) return false;
    if (payment.status === "PENDING") {
      return now - new Date(payment.createdAt).getTime() > PENDING_PAYMENT_GRACE_MS;
    }
    return true;
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lista de ids do body: só UUIDs, sem repetição, entre 1 e BULK_ORDER_LIMIT. */
export function parseBulkOrderIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const valid = value.filter((id): id is string => typeof id === "string" && UUID.test(id));
  if (valid.length !== value.length) return null;
  const ids = Array.from(new Set(valid));
  if (ids.length === 0 || ids.length > BULK_ORDER_LIMIT) return null;
  return ids;
}

export type CsvOrderRow = {
  protocol: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  certificates: string[];
  statusLabel: string;
};

/** CSV dos pedidos (formato em lib/csv). */
export function ordersToCsv(rows: CsvOrderRow[]) {
  return toCsv(
    ["Protocolo", "Data", "Cliente", "E-mail", "Certidões", "Status"],
    rows.map((row) => [
      row.protocol,
      formatCsvDate(row.createdAt),
      row.customerName,
      row.customerEmail,
      row.certificates.join(", "),
      row.statusLabel,
    ])
  );
}
