"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { areaLinksGroup } from "@/components/layout/area-links";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { isBusinessLockedHref } from "@/lib/auth-types";
import { Layers, FileText, FilePlus2, Search, Building2, Users, Wallet, FolderOpen } from "lucide-react";

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
          id: "request",
          label: "Solicitar certidão",
          href: "/painel/solicitar",
          icon: <FilePlus2 className="w-4 h-4" />,
          isActive: pathname.startsWith("/painel/solicitar"),
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
    ...areaLinksGroup(profile, "painel"),
  ];

  return (
    <>
      <DashboardShell groups={groups}>{children}</DashboardShell>
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );
}
