import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertCircle, ArrowRight, Clock, FileWarning, ExternalLink } from "lucide-react";

export interface AttentionItem {
  id: string;
  protocol: string;
  title: string;
  description: string;
  cartorio: string;
  urgency: "high" | "medium";
  timeElapsed: string;
  onAction?: () => void;
}

export interface AttentionPanelProps {
  items: AttentionItem[];
  onViewAll?: () => void;
  className?: string;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({
  items,
  onViewAll,
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
              Nenhuma pendência operacional
            </h4>
            <p className="text-xs text-neutral-500">
              Todas as suas solicitações estão em tramitação normal nos cartórios.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="none"
      className={cn("border-semantic-warning-border bg-neutral-0 overflow-hidden", className)}
    >
      <div className="px-5 py-3.5 bg-semantic-warning-bg/60 border-b border-semantic-warning-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-semantic-warning text-neutral-0 flex items-center justify-center text-xs font-bold shrink-0">
            {items.length}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 leading-tight">
              Atenção Operacional Requerida
            </h3>
            <p className="text-[11px] text-neutral-600">
              Exigências ou pendências notificadas pelos cartórios
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-950 hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="divide-y divide-neutral-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-neutral-50/80 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-neutral-900">
                  {item.protocol}
                </span>
                <StatusBadge
                  status={item.urgency === "high" ? "error" : "warning"}
                  label={item.urgency === "high" ? "Exigência Urgente" : "Com Pendência"}
                  size="sm"
                />
                <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timeElapsed}
                </span>
              </div>

              <p className="text-xs font-medium text-neutral-900">
                {item.title}
              </p>
              <p className="text-[11px] text-neutral-600 leading-relaxed max-w-2xl">
                {item.description}
              </p>
              <span className="text-[10px] text-neutral-400 block">
                Serventia: {item.cartorio}
              </span>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <Button
                size="sm"
                variant="outline"
                onClick={item.onAction}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Resolver Exigência
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
