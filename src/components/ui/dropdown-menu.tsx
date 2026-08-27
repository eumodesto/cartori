"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
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
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-1.5 w-56 rounded-md bg-neutral-0 p-1 shadow-sm border border-neutral-200 focus:outline-none animate-in fade-in zoom-in-95 duration-fast",
            align === "right" ? "right-0" : "left-0",
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

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left font-medium select-none outline-none",
                  item.destructive
                    ? "text-semantic-error hover:bg-semantic-error-bg hover:text-semantic-error-hover"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                  item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-[10px] text-neutral-400 font-mono tracking-widest pl-2 shrink-0">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
