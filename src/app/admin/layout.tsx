"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { Inbox, Layers, Mail, UserCog } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, configured } = useAuth();

  const isAdmin = profile?.role === "ADMIN";

  React.useEffect(() => {
    if (loading || !configured) return;
    if (!profile) {
      router.replace(`/?entrar=1&next=${encodeURIComponent(pathname || "/admin/usuarios")}`);
      return;
    }
    if (!isAdmin) router.replace("/painel");
  }, [configured, loading, profile, isAdmin, pathname, router]);

  if (loading || !profile || !isAdmin) {
    return null;
  }

  const groups: NavGroup[] = [
    {
      label: "Administração",
      items: [
        {
          id: "users",
          label: "Usuários & Clientes",
          href: "/admin/usuarios",
          icon: <UserCog className="w-4 h-4" />,
          isActive: pathname.startsWith("/admin/usuarios"),
        },
        {
          id: "emails",
          label: "E-mails & Templates",
          href: "/admin/emails",
          icon: <Mail className="w-4 h-4" />,
          isActive: pathname.startsWith("/admin/emails"),
        },
      ],
    },
    {
      label: "Navegação",
      items: [
        {
          id: "ops",
          label: "Mesa operacional",
          href: "/operacao/pedidos",
          icon: <Inbox className="w-4 h-4" />,
          isActive: false,
        },
        {
          id: "painel",
          label: "Meu painel",
          href: "/painel",
          icon: <Layers className="w-4 h-4" />,
          isActive: false,
        },
      ],
    },
  ];

  return <DashboardShell groups={groups}>{children}</DashboardShell>;
}
