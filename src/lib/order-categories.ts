import type { DisplayOrderStatus } from "@/lib/order-status";

/** Categorias das listagens de pedidos (equipe e cliente), por status exibido. */
export const ORDER_CATEGORIES: ReadonlyArray<{ id: string; label: string; statuses: DisplayOrderStatus[] }> = [
  { id: "payment", label: "Aguardando pagamento", statuses: ["PAYMENT_PENDING"] },
  { id: "progress", label: "Em andamento", statuses: ["PAYMENT_APPROVED", "IN_ISSUANCE"] },
  { id: "customer", label: "Aguardando cliente", statuses: ["WAITING_CUSTOMER"] },
  { id: "delivered", label: "Entregues", statuses: ["DELIVERED"] },
  { id: "closed", label: "Cancelados", statuses: ["CANCELLED", "REFUNDED", "PAYMENT_REJECTED"] },
];

export function inOrderCategory(category: string, display: DisplayOrderStatus) {
  if (!category) return true;
  return ORDER_CATEGORIES.find((item) => item.id === category)?.statuses.includes(display) ?? true;
}

/** Opções de certidão a partir das linhas, em ordem alfabética. */
export function certificateOptions(rows: ReadonlyArray<{ certificates: string[] }>) {
  const names = Array.from(new Set(rows.flatMap((row) => row.certificates))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  return [{ value: "", label: "Todas as certidões" }, ...names.map((name) => ({ value: name, label: name }))];
}
