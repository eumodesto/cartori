import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "neutral" | "brand";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full select-none shrink-0 transition-colors";

  const variantStyles = {
    default: "bg-neutral-100 text-neutral-800 border border-neutral-200",
    secondary: "bg-neutral-200 text-neutral-900 border border-transparent",
    outline: "bg-neutral-0 text-neutral-700 border border-neutral-300",
    neutral: "bg-neutral-100 text-neutral-600 border border-neutral-200",
    brand: "bg-brand-50 text-brand-900 border border-brand-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-xs leading-tight",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
