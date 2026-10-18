export const SUPPORT_EMAIL = "atendimento@interjuri.com.br";
export const DPO_EMAIL = "dpo@interjuri.com.br";
export const FACEBOOK_URL = "https://www.facebook.com/cartori.certidoes";
export const INSTAGRAM_URL = "https://www.instagram.com/cartori.certidoes";

/** WhatsApp de atendimento: (11) 5306-3514. */
export const WHATSAPP_DISPLAY = "(11) 5306-3514";
export const WHATSAPP_URL = `https://wa.me/551153063514?text=${encodeURIComponent(
  "Olá! Vim pelo site da InterJuri e preciso de ajuda com uma certidão."
)}`;

export const SUPPORT_COMPANY = {
  legalName: "CARTORE EXPRESS LTDA - EPP",
  brand: "InterJuri",
  cnpj: "57.448.583/0001-35",
  city: "São Paulo - SP",
  hours: "Atendimento 24h",
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
    id: "whatsapp",
    title: "WhatsApp",
    description: "Dúvidas rápidas sobre pedidos, prazos e documentos.",
    href: WHATSAPP_URL,
    action: WHATSAPP_DISPLAY,
    external: true,
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
    description: "Depois do primeiro pedido, a assistente responde no painel da sua conta.",
    href: "/painel/pedidos",
    action: "Abrir o painel",
    external: false,
  },
  {
    id: "conta",
    title: "Minha conta",
    description: "Acompanhe status, recados da equipe e documentos no painel da sua solicitação.",
    href: "/painel",
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
