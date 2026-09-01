"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GetStartedButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "isLoading"> {
  iconSize?: number;
  iconClassName?: string;
}

export function GetStartedButton({
  children = "Solicitar",
  className,
  size = "md",
  variant = "primary",
  iconSize,
  iconClassName,
  ...props
}: GetStartedButtonProps) {
  const chevron = iconSize ?? (size === "sm" ? 14 : 16);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "group/started relative overflow-hidden justify-start",
        size === "sm" && "min-w-[8.5rem] pr-10",
        size === "md" && "min-w-[10rem] pr-12",
        size === "lg" && "min-w-[11.5rem] pr-14",
        className
      )}
      {...props}
    >
      <span className="relative z-0 mr-8 whitespace-nowrap transition-opacity duration-500 group-hover/started:opacity-0">
        {children}
      </span>
      <span
        className={cn(
          "absolute right-1 top-1 bottom-1 z-10 grid w-1/4 place-items-center rounded-sm transition-all duration-500 group-hover/started:w-[calc(100%-0.5rem)] group-active/started:scale-95",
          variant === "primary" || variant === "destructive"
            ? "bg-neutral-0/15 text-neutral-0"
            : "bg-brand-950/10 text-brand-950",
          iconClassName
        )}
        aria-hidden="true"
      >
        <ChevronRight size={chevron} strokeWidth={2} />
      </span>
    </Button>
  );
}
