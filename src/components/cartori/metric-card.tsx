import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/layout/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export type MetricVariant = "default" | "info" | "success" | "warning" | "error";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  variant?: MetricVariant;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "default",
  onClick,
  className,
}) => {
  const variantStyles: Record<MetricVariant, { border: string; iconBg: string; text: string }> = {
    default: {
      border: "border-neutral-200",
      iconBg: "bg-neutral-100 text-neutral-700",
      text: "text-neutral-900",
    },
    info: {
      border: "border-semantic-info-border",
      iconBg: "bg-semantic-info-bg text-semantic-info",
      text: "text-semantic-info",
    },
    success: {
      border: "border-semantic-success-border",
      iconBg: "bg-semantic-success-bg text-semantic-success",
      text: "text-semantic-success",
    },
    warning: {
      border: "border-semantic-warning-border",
      iconBg: "bg-semantic-warning-bg text-semantic-warning",
      text: "text-semantic-warning",
    },
    error: {
      border: "border-semantic-error-border",
      iconBg: "bg-semantic-error-bg text-semantic-error",
      text: "text-semantic-error",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <Card
      variant={onClick ? "interactive" : "default"}
      padding="sm"
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between transition-all",
        currentVariant.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-neutral-600 truncate">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
              currentVariant.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded",
                trend.isPositive
                  ? "bg-semantic-success-bg text-semantic-success"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] text-neutral-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
};
