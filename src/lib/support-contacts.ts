export const SUPPORT_EMAIL = "atendimento@cartori.com.br";
export const DPO_EMAIL = "dpo@cartori.com.br";
export const FACEBOOK_URL = "https://www.facebook.com/cartori.certidoes";
export const INSTAGRAM_URL = "https://www.instagram.com/cartori.certidoes";

export const SUPPORT_COMPANY = {
  legalName: "CARTORE EXPRESS LTDA - EPP",
  brand: "Cartori",
  cnpj: "57.448.583/0001-35",
  city: "São Paulo - SP",
  hours: "Atendimento notarial 24h",
} as const;

export const SUPPORT_CHANNELS = [
  {
    id: "atendimento",
    title: "E-mail de atendimento",
    description: "Pedidos, prazos, diligências e cancelamento (art. 49 do CDC).",
    href: `mailto:${SUPPORT_EMAIL}`,
    action: SUPPORT_EMAIL,
    external: false,
  },
  {
    id: "dpo",
    title: "Proteção de dados (DPO)",
    description: "Acesso, correção, exclusão e demais direitos da LGPD. Resposta em até 15 dias úteis.",
    href: `mailto:${DPO_EMAIL}`,
    action: DPO_EMAIL,
    external: false,
  },
  {
    id: "amanda",
    title: "Chat Amanda",
    description: "Tire dúvidas de catálogo e pedido pelo chat da assistente no canto da tela.",
    href: "#amanda",
    action: "Abrir o chat na página",
    external: false,
  },
  {
    id: "conta",
    title: "Minha conta",
    description: "Acompanhe status, recados da equipe e documentos no painel da sua solicitação.",
    href: "/dashboard",
    action: "Abrir o painel",
    external: false,
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "Novidades e atendimento nas redes oficiais @cartori.certidoes.",
    href: INSTAGRAM_URL,
    action: "@cartori.certidoes",
    external: true,
  },
  {
    id: "facebook",
    title: "Facebook",
    description: "Canal oficial Cartori Certidões no Facebook.",
    href: FACEBOOK_URL,
    action: "cartori.certidoes",
    external: true,
  },
] as const;
