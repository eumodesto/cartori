export type Testimonial = {
  text: string;
  name: string;
  role: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Paulo Rolim Advocacia",
    role: "Escritório de Advocacia",
    initials: "PR",
    text: "A agilidade mudou o ritmo das nossas due diligences. Pedidos em lote, prazos visíveis e menos retrabalho com cartório.",
  },
  {
    name: "Roque Pinto Advocacia",
    role: "Escritório de Advocacia",
    initials: "RP",
    text: "Compromisso de verdade: um único pedido para várias certidões, com acompanhamento claro até a emissão.",
  },
  {
    name: "Forte Advocacia",
    role: "Escritório de Advocacia",
    initials: "FA",
    text: "O atendimento é rápido e técnico. Quando há exigência, o time explica o caminho sem enrolação.",
  },
  {
    name: "Farias e Queiroz Advocacia",
    role: "Escritório de Advocacia",
    initials: "FQ",
    text: "O sistema é simples de operar. Inventários e processos ganharam organização — protocolo, cliente e documento no mesmo lugar.",
  },
  {
    name: "Connect Imóveis Exclusive",
    role: "Imobiliária",
    initials: "CI",
    text: "Nas transações, a Cartori encurta a espera por matrícula e ônus. Mais previsibilidade para fechar o negócio.",
  },
  {
    name: "Teixeira de Carvalho",
    role: "Escritório de Advocacia",
    initials: "TC",
    text: "Passamos a confiar no fluxo ponta a ponta. Autoridade operacional: status, prazos e arquivos centralizados.",
  },
  {
    name: "REMAX DIVINA",
    role: "Imobiliária",
    initials: "RD",
    text: "Agilidade que os corretores sentem no dia a dia. Solicitamos, acompanhamos e baixamos tudo sem sair da plataforma.",
  },
  {
    name: "Shopping Imóveis",
    role: "Imobiliária",
    initials: "SI",
    text: "A operação ficou mais profissional. Menos planilha, mais controle — e o cliente percebe a diferença no prazo.",
  },
  {
    name: "Fique aqui imóveis",
    role: "Imobiliária",
    initials: "FI",
    text: "Atendimento próximo e sistema estável. Para quem vive de giro de imóveis, isso é confiança na prática.",
  },
];
