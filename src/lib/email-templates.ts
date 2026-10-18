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
  | "documentacao"
  | "admin";

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
  actionLink: {
    name: "actionLink",
    description: "Link de acesso de uso único (expira; não fica salvo no registro de envios)",
    sample: "https://www.interjuri.com.br/auth/confirmar?token_hash=exemplo",
  },
  newEmail: {
    name: "newEmail",
    description: "Novo e-mail pedido na troca",
    sample: "maria.nova@exemplo.com.br",
  },
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
    sample: "https://www.interjuri.com.br/painel/pedidos/abc123",
  },
  appLink: {
    name: "appLink",
    description: "Link para o painel/portal",
    sample: "https://www.interjuri.com.br/painel",
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
  customerEmail: {
    name: "customerEmail",
    description: "E-mail do cliente/solicitante",
    sample: "maria@exemplo.com.br",
  },
  adminOrderLink: {
    name: "adminOrderLink",
    description: "Link para o pedido na mesa operacional",
    sample: "https://www.interjuri.com.br/operacao/pedidos/abc123",
  },
  paymentMethod: {
    name: "paymentMethod",
    description: "Forma de pagamento (PIX, cartão…)",
    sample: "PIX",
  },
  messagePreview: {
    name: "messagePreview",
    description: "Trecho da mensagem enviada pelo cliente",
    sample: "Segue em anexo a certidão de óbito solicitada.",
  },
} satisfies Record<string, EmailTemplateVariable>;

const SIGN = "\n\nEquipe InterJuri";
const ADMIN_SIGN = "\n\nAviso automático da InterJuri. Ajuste quais avisos recebe em Perfil › Notificações.";

const ADMIN_ORDER_VARS = [
  V.customerName,
  V.customerEmail,
  V.protocol,
  V.total,
  V.itemsList,
  V.paymentMethod,
  V.adminOrderLink,
];

/** Avisos internos para administradores (um template por evento, com opção de receber ou não). */
const ADMIN_TEMPLATES: EmailTemplateDef[] = [
  {
    key: "admin_order_paid",
    group: "admin",
    label: "Admin · Cliente comprou",
    description: "Avisa os administradores quando o pagamento de um pedido é aprovado.",
    subject: "[InterJuri] Nova compra paga · {{protocol}} · {{total}}",
    body:
      "Nova compra confirmada.\n\nPedido: {{protocol}}\nCliente: {{customerName}} ({{customerEmail}})\nTotal: {{total}}\nPagamento: {{paymentMethod}}\n\n{{itemsList}}\n\nAbrir na mesa operacional:\n{{adminOrderLink}}" +
      ADMIN_SIGN,
    variables: ADMIN_ORDER_VARS,
  },
  {
    key: "admin_payment_rejected",
    group: "admin",
    label: "Admin · Compra rejeitada",
    description: "Avisa os administradores quando o pagamento de um pedido é recusado.",
    subject: "[InterJuri] Pagamento recusado · {{protocol}}",
    body:
      "O pagamento de um pedido foi recusado.\n\nPedido: {{protocol}}\nCliente: {{customerName}} ({{customerEmail}})\nTotal: {{total}}\nPagamento: {{paymentMethod}}\n\nAbrir na mesa operacional:\n{{adminOrderLink}}" +
      ADMIN_SIGN,
    variables: ADMIN_ORDER_VARS,
  },
  {
    key: "admin_customer_message",
    group: "admin",
    label: "Admin · Mensagem de cliente",
    description: "Avisa os administradores quando um cliente envia mensagem interna em um pedido.",
    subject: "[InterJuri] Mensagem de {{customerName}} · {{protocol}}",
    body:
      "Nova mensagem do cliente no pedido {{protocol}}.\n\nCliente: {{customerName}} ({{customerEmail}})\n\n“{{messagePreview}}”\n\nResponder na mesa operacional:\n{{adminOrderLink}}" +
      ADMIN_SIGN,
    variables: [V.customerName, V.customerEmail, V.protocol, V.messagePreview, V.adminOrderLink],
  },
  {
    key: "admin_order_pending",
    group: "admin",
    label: "Admin · Compra pendente de pagamento",
    description: "Avisa os administradores quando um pedido é criado e aguarda o pagamento.",
    subject: "[InterJuri] Pedido aguardando pagamento · {{protocol}} · {{total}}",
    body:
      "Um pedido foi criado e aguarda o pagamento.\n\nPedido: {{protocol}}\nCliente: {{customerName}} ({{customerEmail}})\nTotal: {{total}}\n\n{{itemsList}}\n\nAbrir na mesa operacional:\n{{adminOrderLink}}" +
      ADMIN_SIGN,
    variables: ADMIN_ORDER_VARS.filter((v) => v.name !== "paymentMethod"),
  },
];

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
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} foi concluído. Obrigado por confiar na InterJuri! Todos os documentos ficam disponíveis no seu painel:\n{{orderLink}}" +
    SIGN,
  CANCELLED:
    "Olá, {{customerName}}!\n\nO pedido {{protocol}} foi cancelado. Se você tiver qualquer dúvida ou isso não estava previsto, fale com o nosso suporte pelo painel:\n{{orderLink}}" +
    SIGN,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pagamento Pendente",
  PAID: "Pagamento Realizado",
  IN_ANALYSIS: "Documento em Emissão · Em análise",
  IN_CARTORIO_SEARCH: "Documento em Emissão · Busca no cartório",
  WAITING_CUSTOMER: "Aguardando Cliente",
  CERTIFICATE_ISSUED: "Documento Entregue · Certidão emitida",
  SHIPPED: "Documento Entregue · Enviada",
  COMPLETED: "Documento Entregue · Concluída",
  CANCELLED: "Pedido Cancelado",
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
    subject: "InterJuri · pedido {{protocol}}: {{statusLabel}}",
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
    subject: "Bem-vindo(a) à InterJuri, {{customerName}}!",
    body:
      "Olá, {{customerName}}!\n\nSua conta na InterJuri foi criada com sucesso. A partir do seu painel você solicita certidões, acompanha o status e recebe os documentos.\n\nAcesse o painel:\n{{appLink}}" +
      SIGN,
    variables: [V.customerName, V.appLink],
  },
  {
    key: "auth_confirm_signup",
    group: "conta",
    label: "Confirmar cadastro",
    description: "Link para confirmar o e-mail e ativar a conta criada no site.",
    subject: "Confirme seu cadastro na InterJuri",
    body:
      "Olá, {{customerName}}!\n\nFalta um passo para ativar a sua conta na InterJuri. Abra o link abaixo e clique em \"Confirmar e entrar\":\n\n{{actionLink}}\n\nO link vale por tempo limitado e pode ser usado uma vez. Se você não criou esta conta, ignore este e-mail." +
      SIGN,
    variables: [V.customerName, V.actionLink],
  },
  {
    key: "auth_password_reset",
    group: "conta",
    label: "Redefinir senha",
    description: "Link de \"Esqueci minha senha\".",
    subject: "Redefinir sua senha na InterJuri",
    body:
      "Olá, {{customerName}}!\n\nRecebemos um pedido para redefinir a senha da sua conta. Abra o link abaixo para criar uma nova senha:\n\n{{actionLink}}\n\nO link vale por tempo limitado e pode ser usado uma vez. Se não foi você, ignore este e-mail: a senha atual continua valendo." +
      SIGN,
    variables: [V.customerName, V.actionLink],
  },
  {
    key: "auth_email_change",
    group: "conta",
    label: "Confirmar novo e-mail",
    description: "Enviado ao novo endereço quando a pessoa troca o e-mail da conta.",
    subject: "Confirme seu novo e-mail na InterJuri",
    body:
      "Olá, {{customerName}}!\n\nPara que {{newEmail}} passe a ser o e-mail da sua conta na InterJuri, abra o link abaixo e confirme:\n\n{{actionLink}}\n\nO link vale por tempo limitado e pode ser usado uma vez. Se você não pediu a troca, ignore este e-mail." +
      SIGN,
    variables: [V.customerName, V.newEmail, V.actionLink],
  },
  {
    key: "auth_email_change_notice",
    group: "conta",
    label: "Aviso de troca de e-mail",
    description: "Enviado ao e-mail atual avisando que foi pedida a troca para outro endereço.",
    subject: "Pedido de troca do e-mail da sua conta InterJuri",
    body:
      "Olá, {{customerName}}!\n\nFoi pedida a troca do e-mail da sua conta na InterJuri para {{newEmail}}. A troca só vale depois da confirmação no novo endereço.\n\nSe não foi você, troque a sua senha e fale com o suporte: atendimento@interjuri.com.br" +
      SIGN,
    variables: [V.customerName, V.newEmail],
  },
  {
    key: "account_invited",
    group: "conta",
    label: "Conta criada pela equipe",
    description: "Enviado quando a administração cadastra uma conta (cliente, operador ou administrador).",
    subject: "Sua conta na InterJuri está pronta, {{customerName}}",
    body:
      "Olá, {{customerName}}!\n\nA equipe InterJuri criou uma conta para você com este e-mail.\n\nPara o primeiro acesso, abra o link abaixo, clique em Entrar e depois em \"Esqueci minha senha\". Você recebe um link para criar a sua senha.\n\n{{appLink}}\n\nSe você não esperava este e-mail, pode ignorá-lo." +
      SIGN,
    variables: [V.customerName, V.appLink],
  },
  {
    key: "order_created",
    group: "compra",
    label: "Nova compra",
    description: "Confirmação enviada quando um pedido é criado.",
    subject: "InterJuri · recebemos o seu pedido {{protocol}}",
    body:
      "Olá, {{customerName}}!\n\nRecebemos o seu pedido {{protocol}}. Confira os itens:\n\n{{itemsList}}\n\nTotal: {{total}}\n\nAcompanhe o andamento pelo painel:\n{{orderLink}}" +
      SIGN,
    variables: [V.customerName, V.protocol, V.itemsList, V.total, V.orderLink],
  },
  {
    key: "payment_rejected",
    group: "compra",
    label: "Pagamento recusado",
    description: "Enviado ao cliente quando o pagamento é recusado (Mercado Pago ou registro manual).",
    subject: "InterJuri · pagamento do pedido {{protocol}} não aprovado",
    body:
      "Olá, {{customerName}}!\n\nO pagamento do pedido {{protocol}} não foi aprovado. O pedido continua aberto: você pode tentar de novo por PIX ou com outro cartão.\n\nPagar pelo painel:\n{{orderLink}}" +
      SIGN,
    variables: [V.customerName, V.protocol, V.orderLink],
  },
  {
    key: "payment_refunded",
    group: "cancelamento",
    label: "Compra estornada",
    description: "Enviado ao cliente quando o pagamento é estornado e o pedido é cancelado.",
    subject: "InterJuri · estorno do pedido {{protocol}}",
    body:
      "Olá, {{customerName}}!\n\nO pagamento do pedido {{protocol}} foi estornado e o pedido foi cancelado. O prazo para o valor voltar depende do banco ou da operadora do cartão.\n\nDetalhes no painel:\n{{orderLink}}" +
      SIGN,
    variables: [V.customerName, V.protocol, V.orderLink],
  },
  ...STATUS_TEMPLATES,
  {
    key: "docs_request_testamento",
    group: "documentacao",
    label: "Documentos · Certidão Negativa de Testamento",
    description:
      "Solicita a documentação necessária quando o cliente compra a Certidão Negativa de Testamento (CENSEC).",
    subject: "InterJuri · documentos para a Certidão Negativa de Testamento ({{protocol}})",
    body:
      "Olá, {{customerName}}!\n\nPara emitir a Certidão Negativa de Testamento (CENSEC) do pedido {{protocol}}, precisamos de alguns documentos e dados do falecido:\n\n- Nome completo do falecido\n- CPF do falecido (se houver)\n- Data de nascimento e data do óbito\n- Certidão de óbito (foto ou PDF)\n- Nomes dos pais do falecido (filiação)\n\nEnvie os documentos diretamente pelo painel do pedido:\n{{orderLink}}\n\nAssim que recebermos, damos andamento à busca na Central Notarial (CENSEC)." +
      SIGN,
    variables: [V.customerName, V.protocol, V.orderLink],
  },
  ...ADMIN_TEMPLATES,
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
