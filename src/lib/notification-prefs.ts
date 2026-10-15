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
    description: "Comunicados ocasionais da InterJuri (opcional).",
  },
] as const;

/** Avisos internos: só enviados a usuários com papel ADMIN na plataforma. */
export const ADMIN_NOTIFICATION_CATEGORIES = [
  {
    id: "admin_order_paid",
    template: "admin_order_paid",
    label: "Cliente comprou",
    description: "Quando o pagamento de um pedido é aprovado.",
  },
  {
    id: "admin_payment_rejected",
    template: "admin_payment_rejected",
    label: "Compra rejeitada",
    description: "Quando o pagamento de um pedido é recusado.",
  },
  {
    id: "admin_customer_message",
    template: "admin_customer_message",
    label: "Mensagem de cliente",
    description: "Quando um cliente envia mensagem interna em um pedido.",
  },
  {
    id: "admin_order_pending",
    template: "admin_order_pending",
    label: "Compra pendente de pagamento",
    description: "Quando um pedido é criado e aguarda o pagamento.",
  },
] as const;

export type CustomerNotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]["id"];
export type AdminNotificationCategory = (typeof ADMIN_NOTIFICATION_CATEGORIES)[number]["id"];
export type NotificationCategory = CustomerNotificationCategory | AdminNotificationCategory;

export type NotificationPrefs = Record<NotificationCategory, boolean>;

const CATEGORY_IDS: NotificationCategory[] = [
  ...NOTIFICATION_CATEGORIES.map((c) => c.id),
  ...ADMIN_NOTIFICATION_CATEGORIES.map((c) => c.id),
];

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
  const admin = ADMIN_NOTIFICATION_CATEGORIES.find((c) => c.template === key);
  if (admin) return admin.id;
  // account_created e demais → sempre enviar
  return null;
}
