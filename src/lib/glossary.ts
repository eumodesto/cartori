export interface GlossaryTerm {
  term: string;
  category: "Geral" | "Imóveis" | "Registro Civil" | "Notas & CENSEC";
  definition: string;
  tip?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "CNS (Código Nacional de Serventias)",
    category: "Geral",
    definition:
      "Número único de 6 dígitos atribuído pelo Conselho Nacional de Justiça (CNJ) que identifica cada cartório em todo o território brasileiro.",
    tip: "Usamos o CNS para rotear pedidos diretamente à serventia competente sem intermediários desnecessários.",
  },
  {
    term: "Prenotação",
    category: "Imóveis",
    definition:
      "Anotação prévia do pedido no Livro nº 1 (Protocolo) do Cartório de Registro de Imóveis. Garante a prioridade legal do direito sobre o imóvel durante o prazo legal de 30 dias.",
    tip: "A data e hora da prenotação determinam a ordem de preferência em negócios imobiliários concorrentes.",
  },
  {
    term: "Exigência Cartorial (Nota Devolutiva)",
    category: "Geral",
    definition:
      "Notificação formal emitida pelo Oficial do Cartório quando a documentação apresentada necessita de complementação, esclarecimento ou adequação à lei.",
    tip: "Nosso painel avisa imediatamente quando há exigência para que você responda dentro do prazo sem perder o protocolo.",
  },
  {
    term: "Inteiro Teor vs. Breve Relato",
    category: "Registro Civil",
    definition:
      "Breve Relato traz as informações essenciais do assento (nomes, datas, locais). Inteiro Teor é a transcrição integral e literal de tudo o que consta no livro de registro (incluindo anotações e averbações à margem).",
    tip: "Para processos de cidadania, inventários judiciais e compra e venda de imóveis, a certidão em Inteiro Teor é frequentemente exigida.",
  },
  {
    term: "Matrícula de Imóvel Atualizada",
    category: "Imóveis",
    definition:
      "O 'documento de identidade' do imóvel no Cartório de Registro de Imóveis (RGI). Contém o histórico de todos os proprietários, averbações de reformas, penhoras, alienações fiduciárias e hipotecas.",
    tip: "A certidão de matrícula com negativa de ônus e ações reipersecutórias tem validade legal de 30 dias.",
  },
  {
    term: "CENSEC (Central Notarial de Serviços Compartilhados)",
    category: "Notas & CENSEC",
    definition:
      "Banco de dados nacional administrado pelo Colégio Notarial do Brasil (CNB) que centraliza informações de testamentos, escrituras públicas e procurações lavradas em todos os tabelionatos do país.",
    tip: "A Certidão Negativa de Testamento da CENSEC é documento obrigatório em inventários e partilhas.",
  },
  {
    term: "Assinatura Digital ICP-Brasil (PAdES)",
    category: "Geral",
    definition:
      "Padrão brasileiro de assinatura eletrônica qualificada com certificado digital ICP-Brasil e carimbo do tempo oficial, conferindo à certidão em PDF o mesmo valor probante do papel original carimbado.",
    tip: "Você pode apresentar o PDF assinado diretamente a juízes, bancos e órgãos públicos sem necessidade de imprimir.",
  },
  {
    term: "Certidão Vintenária",
    category: "Imóveis",
    definition:
      "Certidão que relata todo o histórico de transmissões, gravames e alterações do imóvel ao longo dos últimos 20 anos.",
    tip: "Essencial na due diligence imobiliária para garantir que não houve fraude à execução ou vícios ocultos na cadeia dominial.",
  },
  {
    term: "Averbação",
    category: "Registro Civil",
    definition:
      "Anotação feita à margem de um registro para constar alterações supervenientes, como divórcio na certidão de casamento, alteração de prenome ou reconhecimento de paternidade.",
    tip: "Se você se divorciou, deve solicitar a Certidão de Casamento 'com averbação de divórcio'.",
  },
  {
    term: "Certidão de Protesto",
    category: "Geral",
    definition:
      "Documento emitido pelo Tabelionato de Protesto que informa a existência ou inexistência de títulos de crédito inadimplidos (cheques, duplicatas, notas promissórias, sentenças) em nome de uma pessoa física ou jurídica.",
    tip: "Abrange os períodos padrão de 5 ou 10 anos.",
  },
];
