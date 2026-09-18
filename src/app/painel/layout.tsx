"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { isBusinessLockedHref } from "@/lib/auth-types";
import {
  Layers,
  FileText,
  Search,
  Building2,
  Users,
  Wallet,
  FolderOpen,
  Inbox,
  UserCog,
} from "lucide-react";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isBusiness, loading, configured } = useAuth();
  const [partnerOpen, setPartnerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && configured && !profile) {
      router.replace(`/?entrar=1&next=${encodeURIComponent(pathname || "/painel")}`);
    }
  }, [configured, loading, pathname, profile, router]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("empresa") === "1" || params.get("parceiro") === "1") {
      setPartnerOpen(true);
    }
  }, []);

  const lockItem = (href: string) =>
    !isBusiness && isBusinessLockedHref(href)
      ? { locked: true, onLockedClick: () => setPartnerOpen(true) }
      : {};

  const isStaff = profile?.role === "ADMIN" || profile?.role === "OPERATOR";
  const isAdmin = profile?.role === "ADMIN";

  const groups: NavGroup[] = [
    {
      label: "Operações Cartoriais",
      items: [
        {
          id: "home",
          label: "Visão geral",
          href: "/painel",
          icon: <Layers className="w-4 h-4" />,
          isActive: pathname === "/painel",
        },
        {
          id: "orders",
          label: "Pedidos",
          href: "/painel/pedidos",
          icon: <FileText className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/pedidos"),
        },
        {
          id: "dossiers",
          label: "Dossiês & Processos",
          href: "/painel/dossies",
          icon: <FolderOpen className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/dossies"),
        },
        {
          id: "search",
          label: "Consulta de cartórios",
          href: "/painel/cartorios",
          icon: <Search className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/cartorios"),
        },
      ],
    },
    {
      label: "Gestão B2B",
      items: [
        {
          id: "org",
          label: "Empresa & Filiais",
          href: "/painel/empresa",
          icon: <Building2 className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/empresa"),
          ...lockItem("/painel/empresa"),
        },
        {
          id: "team",
          label: "Advogados & Equipe",
          href: "/painel/equipe",
          icon: <Users className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/equipe"),
          ...lockItem("/painel/equipe"),
        },
        {
          id: "billing",
          label: "Extrato & Faturamento",
          href: "/painel/financeiro",
          icon: <Wallet className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/financeiro"),
          ...lockItem("/painel/financeiro"),
        },
      ],
    },
    ...(isStaff
      ? [
          {
            label: "Áreas internas",
            items: [
              {
                id: "ops",
                label: "Mesa operacional",
                href: "/operacao/pedidos",
                icon: <Inbox className="w-4 h-4" />,
                isActive: false,
              },
              ...(isAdmin
                ? [
                    {
                      id: "admin",
                      label: "Administração",
                      href: "/admin/usuarios",
                      icon: <UserCog className="w-4 h-4" />,
                      isActive: false,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <DashboardShell groups={groups}>{children}</DashboardShell>
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );
}
