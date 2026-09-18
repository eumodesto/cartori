"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar, type NavGroup } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AccountAlerts } from "@/components/layout/account-alerts";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { maskCpfCnpj } from "@/lib/utils";
import { Search } from "lucide-react";

/**
 * Chrome compartilhado das áreas autenticadas (sidebar + header + main).
 * A guarda de acesso e a montagem dos grupos de navegação ficam em cada layout de seção.
 */
export function DashboardShell({
  groups,
  children,
}: {
  groups: NavGroup[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, isBusiness, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const orgName = profile?.organization?.name || profile?.name || "Minha conta";
  const orgDoc = profile?.organization?.cnpj
    ? maskCpfCnpj(profile.organization.cnpj)
    : profile?.email || "";
  const initials =
    orgName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CT";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-page font-sans">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        currentPath={pathname}
        groups={groups}
        headerContent={
          <div className="flex items-center overflow-hidden py-1">
            <img
              src="/logo-horizontal.svg"
              alt="Cartori"
              className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </div>
        }
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-neutral-0 border-b border-neutral-200 px-6 flex items-center justify-between gap-4 shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por protocolo, CPF/CNPJ, imóvel ou cartório..."
                className="w-full h-9 pl-9 pr-3 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-brand-500 focus:bg-neutral-0 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="ghost" size="md" />
            <AccountAlerts />
            <UserMenu side="bottom" size="sm" />
            <div className="h-5 w-[1px] bg-neutral-200" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-950 font-bold text-xs shrink-0">
                {loading ? "…" : initials}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-semibold text-neutral-900 block leading-tight">
                  {loading ? "Carregando..." : orgName}
                </span>
                <span className="text-[10px] text-neutral-500 block font-mono">
                  {isBusiness ? orgDoc : "Acesso padrão"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface-page p-6 lg:p-8">
          <div className="w-full max-w-[var(--layout-dashboard-max)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
