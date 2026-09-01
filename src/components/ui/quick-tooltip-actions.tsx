"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface QuickTooltipAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface QuickTooltipActionsProps {
  trigger: React.ReactNode;
  triggerLabel: string;
  actions: QuickTooltipAction[];
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

type FlyoutCoords = {
  top: number;
  left: number;
  transform: string;
};

function getFlyoutCoords(
  rect: DOMRect,
  side: NonNullable<QuickTooltipActionsProps["side"]>
): FlyoutCoords {
  const gap = 6;

  switch (side) {
    case "top":
      return {
        top: rect.top - gap,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - gap,
        transform: "translate(-100%, -50%)",
      };
    case "right":
    default:
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + gap,
        transform: "translateY(-50%)",
      };
  }
}

export const QuickTooltipActions: React.FC<QuickTooltipActionsProps> = ({
  trigger,
  triggerLabel,
  actions,
  side = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<FlyoutCoords | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const openedByHoverRef = React.useRef(false);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const open = React.useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  }, []);

  const scheduleClose = React.useCallback(() => {
    openedByHoverRef.current = false;
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 140);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return;
    setCoords(getFlyoutCoords(containerRef.current.getBoundingClientRect(), side));
  }, [side]);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        openedByHoverRef.current = false;
        setIsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-quick-tooltip-flyout]")) return;
      openedByHoverRef.current = false;
      setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const flyout =
    isOpen && coords ? (
      <div
        role="menu"
        aria-label={triggerLabel}
        data-quick-tooltip-flyout=""
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: coords.transform,
        }}
        className={cn(
          "z-[80] flex items-center justify-center gap-0.5 px-1.5 py-1 overflow-visible",
          "bg-neutral-0 text-neutral-700 border border-neutral-200 rounded-lg shadow-sm",
          "animate-in fade-in duration-fast"
        )}
      >
        {actions.map((action) => (
          <QuickActionPill
            key={action.id}
            action={action}
            onNavigate={() => setIsOpen(false)}
          />
        ))}
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => {
        openedByHoverRef.current = true;
        open();
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={open}
      onBlurCapture={(event) => {
        const next = event.relatedTarget as Node | null;
        if (containerRef.current?.contains(next)) return;
        if (next && (next as HTMLElement).closest?.("[data-quick-tooltip-flyout]")) return;
        scheduleClose();
      }}
    >
      <div
        onClick={() => {
          if (openedByHoverRef.current) return;
          setIsOpen((prev) => !prev);
        }}
        className="cursor-pointer"
      >
        {React.isValidElement(trigger)
          ? React.cloneElement(trigger as React.ReactElement<{ "aria-label"?: string }>, {
              "aria-haspopup": "menu",
              "aria-expanded": isOpen,
              "aria-label":
                (trigger as React.ReactElement<{ "aria-label"?: string }>).props[
                  "aria-label"
                ] || triggerLabel,
            })
          : trigger}
      </div>

      {mounted && flyout ? createPortal(flyout, document.body) : null}
    </div>
  );
};

function QuickActionPill({
  action,
  onNavigate,
}: {
  action: QuickTooltipAction;
  onNavigate: () => void;
}) {
  const className = cn(
    "group relative flex items-center justify-center p-1.5 rounded-md",
    "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
    "dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-100/40",
    "transition-colors duration-fast outline-none",
    "focus-visible:ring-2 focus-visible:ring-brand-500"
  );

  const content = (
    <>
      {action.icon}
      <span
        className={cn(
          "pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2",
          "px-2 py-0.5 rounded-sm whitespace-nowrap",
          "text-[11px] font-medium text-neutral-0 bg-neutral-950 shadow-xs",
          "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          "transition-opacity duration-fast"
        )}
      >
        {action.label}
      </span>
    </>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        role="menuitem"
        aria-label={action.label}
        className={className}
        onClick={() => {
          action.onClick?.();
          onNavigate();
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      aria-label={action.label}
      className={className}
      onClick={() => {
        action.onClick?.();
        onNavigate();
      }}
    >
      {content}
    </button>
  );
}
