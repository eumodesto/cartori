/** Filtros comuns das listagens (busca sem acento, período). Puros: testáveis e usados nas telas. */

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Todos os termos da busca precisam aparecer em algum dos campos. */
export function matchesSearch(query: string, fields: Array<string | null | undefined>) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeSearch(fields.filter(Boolean).join(" "));
  return terms.every((term) => haystack.includes(term));
}

export const PERIOD_OPTIONS = [
  { value: "", label: "Qualquer data" },
  { value: "1", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
];

/** period = dias (texto do select); vazio = sem filtro. "1" = desde a meia-noite de hoje. */
export function inPeriod(date: string | Date, period: string, now: Date = new Date()) {
  const days = Number(period);
  if (!period || !Number.isFinite(days) || days <= 0) return true;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return new Date(date).getTime() >= start.getTime();
}

/** Conta quantos itens caem em cada categoria, para os chips mostrarem o número. */
export function countBy<T>(rows: readonly T[], key: (row: T) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(key(row), (counts.get(key(row)) ?? 0) + 1);
  return counts;
}
