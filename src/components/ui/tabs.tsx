"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "underline" | "pill";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-neutral-200 overflow-x-auto",
        variant === "pill" && "border-b-0 bg-neutral-100 p-1 rounded-lg gap-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === "pill") {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "bg-neutral-0 text-neutral-900 shadow-xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-semibold",
                    isActive
                      ? "bg-brand-50 text-brand-900"
                      : "bg-neutral-200 text-neutral-600"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Underline variant (Default)
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-[1px] transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "border-brand-950 text-brand-950 font-semibold"
                : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300",
              tab.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded-full font-semibold",
                  isActive
                    ? "bg-brand-50 text-brand-900 border border-brand-200"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
