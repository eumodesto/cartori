"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
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

  // Previne rolagem do body quando aberto
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
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-fast"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-neutral-0 rounded-lg shadow-md border border-neutral-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-fast",
          sizeStyles[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }> = ({
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
        aria-label="Fechar"
        className="text-neutral-500 hover:text-neutral-900 p-1 rounded-md transition-colors -mr-2"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn("text-base font-semibold text-neutral-900", className)} {...props}>
    {children}
  </h3>
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn("text-xs text-neutral-500", className)} {...props}>
    {children}
  </p>
);

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("p-6 max-h-[calc(100vh-200px)] overflow-y-auto", className)} {...props}>
    {children}
  </div>
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
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
