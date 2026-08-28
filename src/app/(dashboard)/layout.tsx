"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Layers,
  FileText,
  Search,
  Building2,
  Users,
  Wallet,
  Settings,
  Bell,
  Plus,
  ChevronDown,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const sidebarGroups = [
    {
      label: "Operações Cartoriais",
      items: [
        {
          id: "dashboard",
          label: "Painel Geral",
          href: "/dashboard",
          icon: <Layers className="w-4 h-4" />,
          isActive: pathname === "/dashboard",
        },
        {
          id: "requests",
          label: "Solicitações",
          href: "/dashboard/solicitacoes",
          icon: <FileText className="w-4 h-4" />,
          badge: "14",
          isActive: pathname === "/dashboard/solicitacoes",
        },
        {
          id: "dossiers",
          label: "Dossiês & Processos",
          href: "/dashboard/dossies",
          icon: <FolderOpen className="w-4 h-4" />,
          isActive: pathname === "/dashboard/dossies",
        },
        {
          id: "search",
          label: "Busca de Cartórios (CNJ)",
          href: "/dashboard/cartorios",
          icon: <Search className="w-4 h-4" />,
          isActive: pathname === "/dashboard/cartorios",
        },
      ],
    },
    {
      label: "Gestão B2B",
      items: [
        {
          id: "org",
          label: "Empresa & Filiais",
          href: "/dashboard/organizacao",
          icon: <Building2 className="w-4 h-4" />,
          isActive: pathname === "/dashboard/organizacao",
        },
        {
          id: "team",
          label: "Advogados & Equipe",
          href: "/dashboard/equipe",
          icon: <Users className="w-4 h-4" />,
          isActive: pathname === "/dashboard/equipe",
        },
        {
          id: "billing",
          label: "Extrato & Faturamento",
          href: "/dashboard/financeiro",
          icon: <Wallet className="w-4 h-4" />,
          isActive: pathname === "/dashboard/financeiro",
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-page font-sans">
      {/* Collapsible App Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        currentPath={pathname}
        groups={sidebarGroups}
        headerContent={
          <div className="flex flex-col overflow-hidden">
            <img
              src="/logo-horizontal.svg"
              alt="Cartori"
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
            />
            <span className="text-[10px] text-neutral-500 font-medium tracking-tight -mt-0.5">
              SaaS B2B Operacional
            </span>
          </div>
        }
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-neutral-0 border-b border-neutral-200 px-6 flex items-center justify-between gap-4 shrink-0 z-10 shadow-xs">
          {/* Quick Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por protocolo, CPF/CNPJ, imóvel ou cartório..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-brand-500 focus:bg-neutral-0 transition-colors placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Quick action button */}
            <Link href="/dashboard/nova-solicitacao">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Nova Solicitação
              </Button>
            </Link>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle variant="ghost" size="md" />

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-100/40 transition-colors"
              aria-label="Notificações operacionais"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-semantic-warning" />
            </button>

            <div className="h-5 w-[1px] bg-neutral-200" />

            {/* Organization Selector */}
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-950 font-bold text-xs shrink-0">
                SA
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-semibold text-neutral-900 block leading-tight">
                  Silveira & Associados
                </span>
                <span className="text-[10px] text-neutral-500 block font-mono">
                  CNPJ 12.345.678/0001-90
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-surface-page p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
