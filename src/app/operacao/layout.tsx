"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { areaLinksGroup, managementNavGroup } from "@/components/layout/area-links";
import { useAuth } from "@/components/auth/auth-provider";
import { isStaffProfile } from "@/lib/auth-types";

/** Guarda de UI da seção; as páginas filhas só montam para a equipe. Quem autoriza é /api/ops. */
export default function OperacaoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, configured } = useAuth();

  const isStaff = isStaffProfile(profile);

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
    ...managementNavGroup(profile, pathname),
    ...areaLinksGroup(profile, "operacao"),
  ];

  return <DashboardShell groups={groups}>{children}</DashboardShell>;
}
