import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon: React.ReactNode;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "outline",
      size = "md",
      isLoading = false,
      icon,
      disabled,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-fast select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed shrink-0";

    const variantStyles = {
      primary:
        "bg-brand-950 text-neutral-0 hover:bg-brand-900 active:bg-brand-900 border border-transparent shadow-xs",
      secondary:
        "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200",
      outline:
        "bg-neutral-0 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 border border-neutral-300 shadow-xs",
      ghost:
        "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 border border-transparent",
      destructive:
        "bg-semantic-error text-neutral-0 hover:bg-semantic-error-hover active:bg-semantic-error-hover border border-transparent shadow-xs",
    };

    const sizeStyles = {
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
