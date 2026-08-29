"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldAlert,
  FileUp,
  HelpCircle,
} from "lucide-react";

export interface AttentionItem {
  id: string;
  protocol: string;
  title: string;
  description: string;
  cartorio: string;
  urgency: "high" | "medium";
  timeElapsed: string;
  deadlineDate?: string;
  instruction?: string;
  onAction?: () => void;
}

export interface AttentionPanelProps {
  items: AttentionItem[];
  onViewAll?: () => void;
  onResolve?: (item: AttentionItem) => void;
  className?: string;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({
  items,
  onViewAll,
  onResolve,
  className,
}) => {
  if (items.length === 0) {
    return (
      <Card padding="md" className={cn("border-neutral-200 bg-neutral-0", className)}>
        <div className="flex items-center gap-3 text-semantic-success">
          <div className="w-8 h-8 rounded-md bg-semantic-success-bg flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-semantic-success" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">
              Nenhuma pendência operacional ativa
            </h4>
            <p className="text-xs text-neutral-500">
              Todas as suas certidões estão sendo processadas normalmente dentro dos prazos legais.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="none"
      className={cn("border-semantic-warning-border bg-neutral-0 overflow-hidden shadow-xs", className)}
    >
      {/* Header with Didactic Warning */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-semantic-warning-bg/70 border-b border-semantic-warning-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-semantic-warning text-neutral-0 flex items-center justify-center text-xs font-bold shrink-0">
            {items.length}
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 leading-tight flex items-center gap-1.5">
              <span>Exigências Cartoriais Notificadas</span>
              <span className="text-[10px] font-normal text-semantic-warning-text bg-neutral-0/80 px-1.5 py-0.2 rounded border border-semantic-warning-border">
                Ação Requerida
              </span>
            </h3>
            <p className="text-[11px] text-neutral-600">
              O oficial do cartório solicitou complementação para dar andamento à emissão.
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-950 dark:text-brand-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas ({items.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="divide-y divide-neutral-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-100/30 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-neutral-900">
                  {item.protocol}
                </span>
                <StatusBadge
                  status={item.urgency === "high" ? "error" : "warning"}
                  label={item.urgency === "high" ? "Exigência com Prazo" : "Complementação Solicitada"}
                  size="sm"
                />
                <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {item.timeElapsed}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {item.title}
                </p>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mt-0.5">
                  {item.description}
                </p>
              </div>

              {item.instruction && (
                <div className="p-2 bg-neutral-100 dark:bg-neutral-100/50 rounded text-[11px] text-neutral-800 dark:text-neutral-200 flex items-start gap-1.5 border border-neutral-200 dark:border-neutral-200">
                  <FileUp className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>O que fazer:</strong> {item.instruction}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-0.5">
                <span>Serventia: <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{item.cartorio}</strong></span>
                {item.deadlineDate && (
                  <span className="text-semantic-error font-medium">
                    Prazo fatal de resposta: {item.deadlineDate}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <Button
                size="sm"
                variant={item.urgency === "high" ? "primary" : "outline"}
                onClick={() => onResolve ? onResolve(item) : item.onAction?.()}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Cumprir Exigência
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
