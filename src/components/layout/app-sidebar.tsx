"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/layout/user-menu";
import { ChevronLeft, ChevronRight, HelpCircle, Lock } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  locked?: boolean;
  onLockedClick?: () => void;
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
        "relative flex flex-col h-full bg-neutral-0 dark:bg-neutral-0 border-r border-neutral-200 dark:border-neutral-200 transition-all duration-normal ease-out select-none shadow-none z-20 shrink-0",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-neutral-200 dark:border-neutral-200 shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Expandir menu lateral"
            title="Clique para expandir o menu"
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-100/50 transition-colors group cursor-pointer"
          >
            <img
              src="/favicon.svg"
              alt="Cartori Símbolo"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
          </button>
        ) : (
          <>
            {headerContent || (
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src="/logo-horizontal.svg"
                  alt="Cartori B2B"
                  className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
                />
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Recolher menu lateral"
              title="Recolher menu"
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-100/50 transition-colors ml-auto cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Groups */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6",
          isCollapsed ? "px-1.5" : "px-2.5"
        )}
      >
        {groups.map((group, groupIdx) => (
          <div key={group.label || groupIdx} className="space-y-1">
            {group.label && !isCollapsed && (
              <h4 className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {group.label}
              </h4>
            )}

            {isCollapsed && group.label && (
              <div className="w-8 h-[1px] bg-neutral-200 dark:bg-neutral-200/50 mx-auto my-2" />
            )}

            <nav className="space-y-1 flex flex-col items-center">
              {group.items.map((item) => {
                const isActive =
                  item.isActive !== undefined
                    ? item.isActive
                    : currentPath === item.href;

                const itemClass = cn(
                  "flex items-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isCollapsed
                    ? "w-10 h-10 justify-center rounded-lg"
                    : "w-full gap-3 px-2.5 py-2 rounded-md text-xs font-medium",
                  isActive
                    ? "bg-brand-50 text-brand-950 dark:bg-brand-50/20 dark:text-brand-300 font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-100/40",
                  item.locked && "opacity-80"
                );

                const inner = (
                  <>
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center",
                        isActive
                          ? "text-brand-950 dark:text-brand-300"
                          : "text-neutral-500 dark:text-neutral-400"
                      )}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.locked ? (
                          <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                        ) : item.badge !== undefined ? (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0",
                              isActive
                                ? "bg-brand-200 text-brand-950 dark:bg-brand-300 dark:text-neutral-950"
                                : "bg-neutral-200 text-neutral-700 dark:bg-neutral-200 dark:text-neutral-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </>
                );

                const linkElement = item.locked ? (
                  <button
                    type="button"
                    onClick={item.onLockedClick}
                    className={itemClass}
                  >
                    {inner}
                  </button>
                ) : (
                  <Link href={item.href} className={itemClass}>
                    {inner}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <div key={item.id} className="w-full flex justify-center">
                      <Tooltip
                        content={item.locked ? `${item.label} (plano parceiro)` : item.label}
                        side="right"
                      >
                        {linkElement}
                      </Tooltip>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="w-full">
                    {linkElement}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2 border-t border-neutral-200 dark:border-neutral-200 bg-neutral-50/50 dark:bg-neutral-50/20 shrink-0">
        {footerContent || (
          <div
            className={cn(
              "flex items-center text-xs text-neutral-500",
              isCollapsed ? "flex-col gap-2 justify-center" : "justify-between px-1 gap-2"
            )}
          >
            <UserMenu side={isCollapsed ? "right" : "top"} size="sm" />

            {!isCollapsed ? (
              <>
                <span className="text-[11px] font-medium truncate">Cartori v1.0</span>
                <Link
                  href="/ajuda"
                  className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-200/50 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                  title="Ajuda e Suporte"
                >
                  <HelpCircle className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleToggle}
                aria-label="Expandir menu lateral"
                title="Expandir menu lateral"
                className="p-2 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-200/50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
