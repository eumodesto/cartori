"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar, type NavGroup } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AccountAlerts } from "@/components/layout/account-alerts";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { maskCpfCnpj } from "@/lib/utils";
import { Menu, Search } from "lucide-react";

/**
 * Chrome compartilhado das áreas autenticadas (sidebar + header + main).
 * Responsivo: no desktop o sidebar é fixo; no mobile vira um drawer off-canvas.
 * A guarda de acesso e os grupos de navegação ficam em cada layout de seção.
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
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Fecha o drawer ao navegar.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Trava o scroll do body enquanto o drawer está aberto.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  const logo = (
    <div className="flex items-center overflow-hidden py-1">
      <img
        src="/logo-horizontal.svg"
        alt="Cartori"
        className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
      />
    </div>
  );

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-surface-page font-sans">
      {/* Sidebar fixo (desktop) */}
      <div className="hidden lg:flex">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          currentPath={pathname}
          groups={groups}
          headerContent={logo}
        />
      </div>

      {/* Drawer (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl animate-in slide-in-from-left duration-200">
            <AppSidebar
              isCollapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
              currentPath={pathname}
              groups={groups}
              headerContent={logo}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-neutral-0 border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="lg:hidden -ml-1 p-2 rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por protocolo, CPF/CNPJ, imóvel ou cartório..."
                className="w-full h-9 pl-9 pr-3 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-brand-500 focus:bg-neutral-0 transition-colors placeholder:text-neutral-400"
              />
            </div>
            <img
              src="/logo-horizontal.svg"
              alt="Cartori"
              className="h-7 w-auto object-contain sm:hidden dark:brightness-0 dark:invert"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle variant="ghost" size="md" />
            <AccountAlerts />
            <UserMenu side="bottom" size="sm" />
            <div className="hidden sm:block h-5 w-[1px] bg-neutral-200" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-950 font-bold text-xs shrink-0 overflow-hidden">
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : loading ? (
                  "…"
                ) : (
                  initials
                )}
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface-page p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[var(--layout-dashboard-max)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
