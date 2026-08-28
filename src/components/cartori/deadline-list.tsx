import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/layout/card";
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export interface DeadlineItem {
  id: string;
  protocol: string;
  certificate: string;
  cartorio: string;
  expectedDate: string;
  daysRemaining: number;
  slaStatus: "on_time" | "warning" | "delayed";
}

export interface DeadlineListProps {
  items: DeadlineItem[];
  className?: string;
}

export const DeadlineList: React.FC<DeadlineListProps> = ({
  items,
  className,
}) => {
  return (
    <Card padding="none" className={cn("border-neutral-200 bg-neutral-0 overflow-hidden", className)}>
      <CardHeader className="p-4 border-b border-neutral-200 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
              Prazos Notariais & SLA
            </CardTitle>
            <CardDescription className="text-[11px] text-neutral-500">
              Previsão de expedição pelas serventias
            </CardDescription>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {items.length} em acompanhamento
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-neutral-200">
        {items.map((item) => {
          const isDelayed = item.slaStatus === "delayed";
          const isWarning = item.slaStatus === "warning";

          return (
            <div
              key={item.id}
              className="p-3.5 hover:bg-neutral-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-900">
                    {item.protocol}
                  </span>
                  <span className="text-neutral-500 truncate font-medium">
                    {item.certificate}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  {item.cartorio}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={cn(
                    "font-semibold text-xs block",
                    isDelayed
                      ? "text-semantic-error"
                      : isWarning
                      ? "text-semantic-warning"
                      : "text-neutral-900"
                  )}
                >
                  {item.expectedDate}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium block",
                    isDelayed
                      ? "text-semantic-error"
                      : isWarning
                      ? "text-semantic-warning"
                      : "text-neutral-500"
                  )}
                >
                  {item.daysRemaining < 0
                    ? `Atrasado ${Math.abs(item.daysRemaining)}d`
                    : item.daysRemaining === 0
                    ? "Previsto p/ hoje"
                    : `${item.daysRemaining} dias restantes`}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
