import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  label = "Carregando...",
}) => {
  const sizeStyles = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <div
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center text-brand-950"
    >
      <Loader2
        className={cn("animate-spin shrink-0", sizeStyles[size], className)}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
