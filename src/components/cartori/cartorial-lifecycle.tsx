"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/layout/card";
import {
  FileCheck2,
  BookOpenCheck,
  Search,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export interface LifecycleStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  sla: string;
  color: string;
}

export const CartorialLifecycle: React.FC<{ onOpenGlossary?: () => void }> = ({
  onOpenGlossary,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const steps: LifecycleStep[] = [
    {
      number: 1,
      title: "Triagem & Custas",
      subtitle: "Validação inicial",
      description:
        "Os dados são conferidos pelo nosso sistema e as taxas notariais (emolumentos estaduais) são recolhidas sem surpresas.",
      icon: <FileCheck2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
      sla: "Até 2h",
      color: "bg-brand-50 text-brand-950 dark:bg-brand-950/40 dark:text-brand-300 border-brand-200 dark:border-brand-800",
    },
    {
      number: 2,
      title: "Prenotação Oficial",
      subtitle: "Protocolo na Serventia",
      description:
        "O pedido recebe número de protocolo no livro oficial do cartório, garantindo prioridade legal e preferência de registro.",
      icon: <BookOpenCheck className="w-4 h-4 text-semantic-info" />,
      sla: "Mesmo dia",
      color: "bg-semantic-info-bg text-semantic-info border-semantic-info-border",
    },
    {
      number: 3,
      title: "Exame & Qualificação",
      subtitle: "Busca nos Livros",
      description:
        "O escrevente ou oficial examina os livros do cartório. Caso falte algum dado, é emitida uma 'Exigência' para complementação.",
      icon: <Search className="w-4 h-4 text-semantic-warning" />,
      sla: "1 a 3 dias úteis",
      color: "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border",
    },
    {
      number: 4,
      title: "Emissão ICP-Brasil",
      subtitle: "Documento com Fé Pública",
      description:
        "A certidão digital é lavrada com assinatura digital qualificada (Padrão ICP-Brasil), com validade plena em qualquer banco ou tribunal.",
      icon: <Award className="w-4 h-4 text-semantic-success" />,
      sla: "Download Imediato",
      color: "bg-semantic-success-bg text-semantic-success border-semantic-success-border",
    },
  ];

  return (
    <Card
      padding="none"
      className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 text-neutral-0 border-brand-800 overflow-hidden shadow-sm"
    >
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-800/80 border border-brand-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-neutral-0">
                Ciclo de Expedição das suas Certidões
              </h3>
              <span className="text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Lei 6.015/73
              </span>
            </div>
            <p className="text-xs text-brand-200 mt-0.5">
              Entenda cada etapa do processo e acompanhe prazos reais em qualquer cartório do Brasil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onOpenGlossary && (
            <button
              type="button"
              onClick={onOpenGlossary}
              className="text-xs text-brand-200 hover:text-neutral-0 bg-brand-800/60 hover:bg-brand-800 border border-brand-700/60 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Glossário Notarial</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs text-neutral-0 bg-brand-500/30 hover:bg-brand-500/40 border border-brand-400/40 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>{isExpanded ? "Ocultar Detalhes" : "Como Funciona?"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 4 Steps Interactive Grid */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-brand-900/60 border border-brand-800/80 rounded-lg p-3.5 flex flex-col justify-between transition-all hover:bg-brand-900 hover:border-brand-700"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-800 text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0 border border-brand-700">
                      {step.number}
                    </span>
                    <span className="text-xs font-bold text-neutral-0">
                      {step.title}
                    </span>
                  </div>
                  <div className="p-1 rounded bg-brand-950/80 border border-brand-800">
                    {step.icon}
                  </div>
                </div>

                <div className="text-[11px] text-brand-300 font-medium">
                  {step.subtitle}
                </div>

                {isExpanded && (
                  <p className="text-[11px] text-neutral-300 leading-relaxed pt-1 border-t border-brand-800/60 animate-in fade-in duration-200">
                    {step.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-brand-800/40 flex items-center justify-between text-[10px] text-brand-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>SLA Médio:</span>
                </span>
                <span className="font-semibold text-neutral-100">{step.sla}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
