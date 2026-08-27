import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "neutral" | "info" | "success" | "warning" | "error";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  className,
  status = "neutral",
  label,
  showDot = true,
  size = "md",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full select-none shrink-0 border transition-colors";

  const statusStyles: Record<StatusType, { bg: string; dot: string }> = {
    neutral: {
      bg: "bg-neutral-100 text-neutral-700 border-neutral-300",
      dot: "bg-neutral-500",
    },
    info: {
      bg: "bg-semantic-info-bg text-semantic-info border-semantic-info-border",
      dot: "bg-semantic-info",
    },
    success: {
      bg: "bg-semantic-success-bg text-semantic-success border-semantic-success-border",
      dot: "bg-semantic-success",
    },
    warning: {
      bg: "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border",
      dot: "bg-semantic-warning",
    },
    error: {
      bg: "bg-semantic-error-bg text-semantic-error border-semantic-error-border",
      dot: "bg-semantic-error",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-xs leading-tight",
  };

  const currentStatus = statusStyles[status] || statusStyles.neutral;

  return (
    <span
      className={cn(baseStyles, currentStatus.bg, sizeStyles[size], className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", currentStatus.dot)}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
};
