import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}) => {
  const iconMap: Record<AlertVariant, React.ReactNode> = {
    info: <Info className="w-5 h-5 text-semantic-info shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-semantic-warning shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />,
  };

  const styleMap: Record<AlertVariant, string> = {
    info: "bg-semantic-info-bg border-semantic-info-border text-neutral-900",
    success: "bg-semantic-success-bg border-semantic-success-border text-neutral-900",
    warning: "bg-semantic-warning-bg border-semantic-warning-border text-neutral-900",
    error: "bg-semantic-error-bg border-semantic-error-border text-neutral-900",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-md border text-sm transition-colors",
        styleMap[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{iconMap[variant]}</div>
      
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold text-neutral-900 leading-tight">{title}</h5>}
        {children && <div className="text-xs text-neutral-700 leading-relaxed">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar alerta"
          className="text-neutral-500 hover:text-neutral-800 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
