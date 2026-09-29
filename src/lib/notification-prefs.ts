export const NOTIFICATION_CATEGORIES = [
  {
    id: "order_updates",
    label: "Atualizações de pedidos",
    description: "Confirmações, mudanças de status e conclusão dos seus pedidos.",
  },
  {
    id: "documents",
    label: "Solicitações de documentos",
    description: "Quando precisamos de documentos ou informações para dar andamento.",
  },
  {
    id: "news",
    label: "Novidades e dicas",
    description: "Comunicados ocasionais da Cartori (opcional).",
  },
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]["id"];

export type NotificationPrefs = Record<NotificationCategory, boolean>;

const CATEGORY_IDS = NOTIFICATION_CATEGORIES.map((c) => c.id);

/** Normaliza o JSON salvo em prefs completas (default: tudo habilitado). */
export function resolveNotificationPrefs(raw: unknown): NotificationPrefs {
  const prefs = {} as NotificationPrefs;
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  for (const id of CATEGORY_IDS) {
    prefs[id] = source[id] === false ? false : true;
  }
  return prefs;
}

/** Aceita apenas as chaves conhecidas e valores boolean. */
export function sanitizeNotificationPrefs(raw: unknown): NotificationPrefs {
  return resolveNotificationPrefs(raw);
}

/** Categoria de notificação de um template (null = transacional crítico, sempre enviado). */
export function notificationCategoryForTemplate(
  key: string
): NotificationCategory | null {
  if (key === "order_created" || key.startsWith("order_status_")) return "order_updates";
  if (key === "docs_request_testamento") return "documents";
  // account_created e demais → sempre enviar
  return null;
}
