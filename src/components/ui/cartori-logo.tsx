"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CartoriLogoProps {
  variant?: "horizontal" | "icon" | "responsive";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  priority?: boolean;
}

export const CartoriLogo: React.FC<CartoriLogoProps> = ({
  variant = "horizontal",
  size = "md",
  href = "/",
  className,
}) => {
  const sizeConfig = {
    horizontal: {
      sm: "h-6 w-auto",
      md: "h-8 w-auto",
      lg: "h-10 sm:h-11 w-auto",
    },
    icon: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10",
    },
  };

  const content = (
    <div className={cn("inline-flex items-center select-none group", className)}>
      {variant === "icon" && (
        <img
          src="/favicon.svg"
          alt="Cartori Símbolo"
          className={cn("object-contain shrink-0 transition-transform group-hover:scale-105", sizeConfig.icon[size])}
        />
      )}

      {variant === "horizontal" && (
        <img
          src="/logo-horizontal.svg"
          alt="Cartori - Hub de Serviços Notariais"
          className={cn(
            "object-contain shrink-0 transition-transform group-hover:scale-[1.02]",
            "dark:brightness-0 dark:invert",
            sizeConfig.horizontal[size]
          )}
        />
      )}

      {variant === "responsive" && (
        <>
          {/* Mobile/Collapsed icon */}
          <img
            src="/favicon.svg"
            alt="Cartori Símbolo"
            className={cn(
              "object-contain shrink-0 md:hidden transition-transform group-hover:scale-105",
              sizeConfig.icon[size]
            )}
          />
          {/* Desktop/Expanded horizontal logo */}
          <img
            src="/logo-horizontal.svg"
            alt="Cartori - Hub de Serviços Notariais"
            className={cn(
              "object-contain shrink-0 hidden md:block transition-transform group-hover:scale-[1.02]",
              "dark:brightness-0 dark:invert",
              sizeConfig.horizontal[size]
            )}
          />
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
