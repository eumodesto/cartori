import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base Classes (No pills, no heavy gradients, clean operational B2B styling)
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-fast select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

    // Variants mapped to Semantic Tokens
    const variantStyles = {
      primary:
        "bg-brand-950 text-neutral-0 hover:bg-brand-900 active:bg-brand-900 border border-transparent shadow-xs",
      secondary:
        "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200",
      outline:
        "bg-neutral-0 text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 shadow-xs",
      ghost:
        "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 border border-transparent",
      destructive:
        "bg-semantic-error text-neutral-0 hover:bg-semantic-error-hover active:bg-semantic-error-hover border border-transparent shadow-xs",
    };

    // Sizes
    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-5 text-base gap-2.5",
      icon: "h-10 w-10 p-0 shrink-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {size !== "icon" && <span>Carregando...</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
