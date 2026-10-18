/** Presença na plataforma (puro: servidor e tela). */

export const SEEN_WRITE_INTERVAL_MS = 60 * 1000;
/** Visto nos últimos 5 minutos = Online (a caixa de alertas consulta a cada 2 minutos). */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function isOnline(lastSeenAt: string | Date | null | undefined, now: Date = new Date()) {
  if (!lastSeenAt) return false;
  return now.getTime() - new Date(lastSeenAt).getTime() <= ONLINE_WINDOW_MS;
}

/** "18/10/2026 às 21:08" no fuso de São Paulo. */
export function formatLoginDate(value: string | Date) {
  const date = new Date(value);
  const day = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const time = date.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  return `${day} às ${time}`;
}

/** "agora", "há 12 min", "há 3 h", "há 2 dias". */
export function timeAgo(value: string | Date, now: Date = new Date()) {
  const minutes = Math.floor((now.getTime() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}
