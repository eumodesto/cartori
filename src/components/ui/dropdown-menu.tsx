"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  shortcut?: string;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItem | "separator")[];
  align?: "left" | "right";
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 6,
      left: align === "right" ? rect.right : rect.left,
    });
  }, [align]);

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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-dropdown-menu-panel]")) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menu =
    isOpen && coords ? (
      <div
        role="menu"
        aria-orientation="vertical"
        data-dropdown-menu-panel=""
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: align === "right" ? "translateX(-100%)" : undefined,
        }}
        className={cn(
          "z-[80] w-56 rounded-md bg-neutral-0 p-1 shadow-sm border border-neutral-200 focus:outline-none animate-in fade-in zoom-in-95 duration-fast",
          className
        )}
      >
        {items.map((item, index) => {
          if (item === "separator") {
            return (
              <div
                key={`sep-${index}`}
                className="my-1 h-[1px] bg-neutral-200"
                role="separator"
              />
            );
          }

          const itemClass = cn(
            "flex w-full items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left font-medium select-none outline-none",
            item.destructive
              ? "text-semantic-error hover:bg-semantic-error-bg hover:text-semantic-error-hover"
              : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
            item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          );
          const content = (
            <>
              <div className="flex items-center gap-2 truncate">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest pl-2 shrink-0">
                  {item.shortcut}
                </span>
              )}
            </>
          );

          if (item.href && !item.disabled) {
            return (
              <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
              className={itemClass}
            >
              {content}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
};
