"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  size?: "sm" | "md";
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = "md",
  variant = "ghost",
  showLabel = false,
  className,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sizeStyles = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-2.5 text-xs",
  };

  const variantStyles = {
    ghost: "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-0 dark:hover:bg-neutral-100/50",
    outline: "bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-300 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-200 shadow-xs",
    default: "bg-neutral-100 dark:bg-neutral-200 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-300",
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-300 opacity-50",
          size === "sm" ? "w-8 h-8" : "w-9 h-9",
          className
        )}
      >
        <span className="w-4 h-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
      title={isDark ? "Modo Claro" : "Modo Escuro"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-600 animate-in fade-in zoom-in-75 duration-200" />
      )}

      {showLabel && (
        <span className="truncate">
          {isDark ? "Claro" : "Escuro"}
        </span>
      )}
    </button>
  );
};
