"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconBarItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: string | number;
  variant?: "default" | "primary" | "destructive";
  disabled?: boolean;
}

export interface IconBarProps {
  items: IconBarItemData[];
  className?: string;
}

export const IconBar: React.FC<IconBarProps> = ({ items, className }) => {
  return (
    <nav
      aria-label="Ações Rápidas (Contextual Toolbar)"
      className={cn(
        "inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-neutral-0 border border-neutral-200 shadow-sm",
        className
      )}
    >
      {items.map((item) => (
        <IconBarItem key={item.id} item={item} />
      ))}
    </nav>
  );
};

export const IconBarItem: React.FC<{ item: IconBarItemData }> = ({ item }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isExpanded = isHovered || isFocused;

  const variantStyles = {
    default:
      "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border border-neutral-200/80",
    primary:
      "bg-brand-950 hover:bg-brand-900 text-neutral-0 border border-transparent shadow-xs",
    destructive:
      "bg-semantic-error-bg hover:bg-semantic-error-bg text-semantic-error border border-semantic-error-border",
  };

  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={item.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label={item.label}
      className={cn(
        "group relative flex items-center h-9 px-2.5 rounded-md transition-all duration-normal ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-500",
        variantStyles[item.variant || "default"],
        item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
      )}
    >
      {/* Icon */}
      <span className="shrink-0 flex items-center justify-center">
        {item.icon}
      </span>

      {/* Expandable Label */}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-normal ease-out",
          isExpanded
            ? "max-w-[160px] opacity-100 ml-2"
            : "max-w-0 opacity-0 ml-0"
        )}
      >
        {item.label}
      </span>

      {/* Optional Badge */}
      {item.badge !== undefined && (
        <span
          className={cn(
            "ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full",
            item.variant === "primary"
              ? "bg-brand-500 text-neutral-0"
              : "bg-neutral-200 text-neutral-700"
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
};
