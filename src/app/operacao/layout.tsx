"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { Inbox, Layers, UserCog } from "lucide-react";

export default function OperacaoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, configured } = useAuth();

  const isStaff = profile?.role === "ADMIN" || profile?.role === "OPERATOR";
  const isAdmin = profile?.role === "ADMIN";

  React.useEffect(() => {
    if (loading || !configured) return;
    if (!profile) {
      router.replace(`/?entrar=1&next=${encodeURIComponent(pathname || "/operacao/pedidos")}`);
      return;
    }
    if (!isStaff) router.replace("/painel");
  }, [configured, loading, profile, isStaff, pathname, router]);

  if (loading || !profile || !isStaff) {
    return null;
  }

  const groups: NavGroup[] = [
    {
      label: "Mesa operacional",
      items: [
        {
          id: "queue",
          label: "Fila de pedidos",
          href: "/operacao/pedidos",
          icon: <Inbox className="w-4 h-4" />,
          isActive: pathname.startsWith("/operacao/pedidos"),
        },
      ],
    },
    {
      label: "Navegação",
      items: [
        {
          id: "painel",
          label: "Meu painel",
          href: "/painel",
          icon: <Layers className="w-4 h-4" />,
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
  ];

  return <DashboardShell groups={groups}>{children}</DashboardShell>;
}
