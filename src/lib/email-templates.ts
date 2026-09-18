/**
 * Catálogo de templates de e-mail (defaults em código).
 * O admin pode sobrescrever no banco (EmailTemplate); sem override, usa-se o default daqui.
 * Interpolação simples de {{variavel}}. Variáveis desconhecidas viram string vazia.
 */

export type EmailTemplateGroup =
  | "conta"
  | "compra"
  | "status"
  | "cancelamento"
  | "documentacao";

export interface EmailTemplateVariable {
  name: string;
  description: string;
  sample: string;
}

export interface EmailTemplateDef {
  key: string;
  group: EmailTemplateGroup;
  label: string;
  description: string;
  /** Presente apenas para templates de status de pedido. */
  status?: string;
  subject: string;
  body: string;
  variables: EmailTemplateVariable[];
}

const V = {
  customerName: {
    name: "customerName",
    description: "Nome do cliente/solicitante",
    sample: "Maria Silva",
  },
  protocol: {
    name: "protocol",
    description: "Protocolo do pedido",
    sample: "CART-2026-000123",
  },
  orderLink: {
    name: "orderLink",
    description: "Link para o pedido no painel",
    sample: "https://www.cartori.com.br/dashboard/solicitacoes/abc123",
  },
  appLink: {
    name: "appLink",
    description: "Link para o painel/portal",
    sample: "https://www.cartori.com.br/dashboard",
  },
  total: {
    name: "total",
    description: "Valor total do pedido (formatado)",
    sample: "R$ 331,90",
  },
  itemsList: {
    name: "itemsList",
    description: "Lista de certidões do pedido (uma por linha)",
    sample: "- Certidão de Casamento (São Paulo/SP)\n- Certidão de Nascimento (Santos/SP)",
  },
  statusLabel: {
    name: "statusLabel",
    description: "Rótulo legível do status",
    sample: "Em análise",
  },
} satisfies Record<string, EmailTemplateVariable>;

const SIGN = "\n\nEquipe Cartori";

/** Corpo default por status de pedido. */
const STATUS_BODIES: Record<string, string> = {
  PENDING_PAYMENT:
    "Olá, {{customerName}}!\n\nRecebemos o seu pedido {{protocol}} e ele está aguardando a confirmação do pagamento. Assim que o pagamento for aprovado, iniciamos a diligência.\n\nAcompanhe pelo painel:\n{{orderLink}}" +
    SIGN,
  PAID:
    "Olá, {{customerName}}!\n\nO pagamento do pedido {{protocol}} foi confirmado. Já vamos iniciar a análise e a diligência junto ao cartório/órgão responsável.\n\nAcompanhe pelo painel:\n{{orderLink}}" +
    SIGN,
  IN_ANALYSIS:
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} está em análise pela nossa equipe. Em breve avançamos para a busca no cartório/órgão.\n\nAcompanhe pelo painel:\n{{orderLink}}" +
    SIGN,
  IN_CARTORIO_SEARCH:
    "Olá, {{customerName}}!\n\nEstamos realizando a busca da serventia e a diligência do pedido {{protocol}} junto ao cartório/órgão competente.\n\nAcompanhe pelo painel:\n{{orderLink}}" +
    SIGN,
  WAITING_CUSTOMER:
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} precisa de uma ação sua (documento ou informação) para continuar. Abra o painel para ver o que é necessário e responder:\n{{orderLink}}" +
    SIGN,
  CERTIFICATE_ISSUED:
    "Olá, {{customerName}}!\n\nBoa notícia: a certidão do pedido {{protocol}} foi emitida. Acesse o painel para baixar a via digital e acompanhar o envio, quando aplicável:\n{{orderLink}}" +
    SIGN,
  SHIPPED:
    "Olá, {{customerName}}!\n\nA via física do pedido {{protocol}} foi enviada. Você pode acompanhar os detalhes de envio pelo painel:\n{{orderLink}}" +
    SIGN,
  COMPLETED:
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} foi concluído. Obrigado por confiar na Cartori! Todos os documentos ficam disponíveis no seu painel:\n{{orderLink}}" +
    SIGN,
  CANCELLED:
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} foi cancelado. Se você tiver qualquer dúvida ou isso não estava previsto, fale com o nosso suporte pelo painel:\n{{orderLink}}" +
    SIGN,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  IN_ANALYSIS: "Em análise",
  IN_CARTORIO_SEARCH: "Busca no cartório",
  WAITING_CUSTOMER: "Ação do cliente",
  CERTIFICATE_ISSUED: "Certidão emitida",
  SHIPPED: "Enviada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const ORDER_STATUS_TEMPLATE_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_ANALYSIS",
  "IN_CARTORIO_SEARCH",
  "WAITING_CUSTOMER",
  "CERTIFICATE_ISSUED",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export function orderStatusTemplateKey(status: string) {
  return `order_status_${status}`;
}

const STATUS_TEMPLATES: EmailTemplateDef[] = ORDER_STATUS_TEMPLATE_STATUSES.map(
  (status) => ({
    key: orderStatusTemplateKey(status),
    group: status === "CANCELLED" ? "cancelamento" : "status",
    label: STATUS_LABELS[status] || status,
    description:
      status === "CANCELLED"
        ? "Enviado quando o pedido é cancelado."
        : `Enviado quando o pedido muda para "${STATUS_LABELS[status] || status}".`,
    status,
    subject: "Cartori · pedido {{protocol}}: {{statusLabel}}",
    body: STATUS_BODIES[status],
    variables: [V.customerName, V.protocol, V.statusLabel, V.orderLink],
  })
);

export const EMAIL_TEMPLATE_DEFS: EmailTemplateDef[] = [
  {
    key: "account_created",
    group: "conta",
    label: "Nova conta",
    description: "Boas-vindas enviadas quando um novo usuário cria conta.",
    subject: "Bem-vindo(a) à Cartori, {{customerName}}!",
    body:
      "Olá, {{customerName}}!\n\nSua conta na Cartori foi criada com sucesso. A partir do seu painel você solicita certidões, acompanha o status e recebe os documentos.\n\nAcesse o painel:\n{{appLink}}" +
      SIGN,
    variables: [V.customerName, V.appLink],
  },
  {
    key: "order_created",
    group: "compra",
    label: "Nova compra",
    description: "Confirmação enviada quando um pedido é criado.",
    subject: "Cartori · recebemos o seu pedido {{protocol}}",
    body:
      "Olá, {{customerName}}!\n\nRecebemos o seu pedido {{protocol}}. Confira os itens:\n\n{{itemsList}}\n\nTotal: {{total}}\n\nAcompanhe o andamento pelo painel:\n{{orderLink}}" +
      SIGN,
    variables: [V.customerName, V.protocol, V.itemsList, V.total, V.orderLink],
  },
  ...STATUS_TEMPLATES,
  {
    key: "docs_request_testamento",
    group: "documentacao",
    label: "Documentos · Certidão Negativa de Testamento",
    description:
      "Solicita a documentação necessária quando o cliente compra a Certidão Negativa de Testamento (CENSEC).",
    subject: "Cartori · documentos para a Certidão Negativa de Testamento ({{protocol}})",
    body:
      "Olá, {{customerName}}!\n\nPara emitir a Certidão Negativa de Testamento (CENSEC) do pedido {{protocol}}, precisamos de alguns documentos e dados do falecido:\n\n- Nome completo do falecido\n- CPF do falecido (se houver)\n- Data de nascimento e data do óbito\n- Certidão de óbito (foto ou PDF)\n- Nomes dos pais do falecido (filiação)\n\nEnvie os documentos diretamente pelo painel do pedido:\n{{orderLink}}\n\nAssim que recebermos, damos andamento à busca na Central Notarial (CENSEC)." +
      SIGN,
    variables: [V.customerName, V.protocol, V.orderLink],
  },
];

export function getEmailTemplateDef(key: string): EmailTemplateDef | undefined {
  return EMAIL_TEMPLATE_DEFS.find((t) => t.key === key);
}

export function listEmailTemplateDefs(): EmailTemplateDef[] {
  return EMAIL_TEMPLATE_DEFS;
}

/** Interpolação simples de {{variavel}} (com ou sem espaços). */
export function renderTemplateString(
  template: string,
  vars: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, name: string) => {
    const value = vars[name];
    return value === null || value === undefined ? "" : String(value);
  });
}
