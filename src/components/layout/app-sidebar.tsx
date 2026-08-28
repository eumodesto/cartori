"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, LogOut, Settings, HelpCircle } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  groups: NavGroup[];
  currentPath?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  groups,
  currentPath,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  headerContent,
  footerContent,
  className,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <aside
      aria-label="Menu Lateral Principal"
      className={cn(
        "relative flex flex-col h-full bg-neutral-0 border-r border-neutral-200 transition-all duration-normal ease-out select-none shadow-none z-20",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-neutral-200 shrink-0">
        {headerContent ? (
          <div className="truncate flex items-center gap-2.5">
            {headerContent}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 truncate">
            <img
              src="/favicon.svg"
              alt="Cartori"
              className="w-8 h-8 object-contain shrink-0"
            />
            {!isCollapsed && (
              <span className="font-semibold text-sm text-neutral-900 tracking-tight truncate">
                Cartori B2B
              </span>
            )}
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
        {groups.map((group, groupIdx) => (
          <div key={group.label || groupIdx} className="space-y-1">
            {group.label && !isCollapsed && (
              <h4 className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {group.label}
              </h4>
            )}

            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.isActive !== undefined
                    ? item.isActive
                    : currentPath === item.href;

                const navLink = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      isActive
                        ? "bg-brand-50 text-brand-950 font-semibold"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isActive ? "text-brand-950" : "text-neutral-500"
                      )}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0",
                              isActive
                                ? "bg-brand-200 text-brand-950"
                                : "bg-neutral-200 text-neutral-700"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.id} content={item.label} side="right">
                      {navLink}
                    </Tooltip>
                  );
                }

                return <div key={item.id}>{navLink}</div>;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-neutral-200 bg-neutral-50/50 shrink-0">
        {footerContent || (
          <div className="flex items-center justify-between text-xs text-neutral-500">
            {!isCollapsed ? (
              <span className="text-[11px] px-1.5 font-medium">Cartori v1.0</span>
            ) : null}
            <Link
              href="/ajuda"
              className="p-1.5 rounded-md hover:bg-neutral-200 hover:text-neutral-800 transition-colors"
              title="Ajuda e Suporte"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
