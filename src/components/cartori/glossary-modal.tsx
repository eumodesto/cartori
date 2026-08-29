"use client";

import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ExternalLink, HelpCircle, CheckCircle2 } from "lucide-react";

export interface GlossaryTerm {
  term: string;
  category: "Geral" | "Imóveis" | "Registro Civil" | "Notas & CENSEC";
  definition: string;
  tip?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
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

export const GlossaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", "Geral", "Imóveis", "Registro Civil", "Notas & CENSEC"];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-950 dark:text-brand-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle>Glossário Notarial & Registral Didático</DialogTitle>
            <DialogDescription>
              Entenda termos técnicos, siglas e procedimentos dos cartórios de forma simples e direta.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Search and Filters */}
        <div className="space-y-2.5">
          <Input
            placeholder="Buscar por termo ou dúvida (ex: Prenotação, CNS, Inteiro Teor, CENSEC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-950 text-neutral-0 dark:bg-brand-50 dark:text-brand-950 font-semibold"
                    : "bg-neutral-100 dark:bg-neutral-100 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                }`}
              >
                {cat === "all" ? "Todos os Termos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards */}
        <div className="space-y-3">
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-200 bg-neutral-50/50 dark:bg-neutral-50/20 space-y-1.5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-900">
                  {item.term}
                </h4>
                <Badge variant="outline" size="sm">
                  {item.category}
                </Badge>
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {item.definition}
              </p>

              {item.tip && (
                <div className="flex items-start gap-1.5 p-2 bg-brand-50/60 dark:bg-brand-950/30 rounded border border-brand-200/60 dark:border-brand-900/60 text-[11px] text-brand-950 dark:text-brand-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">Dica prática:</strong> {item.tip}
                  </span>
                </div>
              )}
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              Nenhum termo notarial encontrado para &ldquo;{search}&rdquo;. Tente buscar por outros termos.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
