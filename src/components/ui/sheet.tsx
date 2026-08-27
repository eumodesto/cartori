"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  children,
  side = "right",
  className,
  size = "md",
}) => {
  // Fecha com ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const sideStyles = {
    left: "left-0 top-0 bottom-0 animate-in slide-in-from-left duration-normal",
    right: "right-0 top-0 bottom-0 animate-in slide-in-from-right duration-normal",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-fast"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed w-full bg-neutral-0 shadow-md border-neutral-200 flex flex-col z-10",
          side === "left" ? "border-r" : "border-l",
          sizeStyles[size],
          sideStyles[side],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }> = ({
  className,
  children,
  onClose,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50",
      className
    )}
    {...props}
  >
    <div className="space-y-0.5">{children}</div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar painel"
        className="text-neutral-500 hover:text-neutral-900 p-1 rounded-md transition-colors -mr-2"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn("text-base font-semibold text-neutral-900", className)} {...props}>
    {children}
  </h3>
);

export const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn("text-xs text-neutral-500", className)} {...props}>
    {children}
  </p>
);

export const SheetContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("flex-1 p-6 overflow-y-auto", className)} {...props}>
    {children}
  </div>
);

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50/50",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
