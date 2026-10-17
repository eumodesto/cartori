"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup } from "@/components/layout/app-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { areaLinksGroup, managementNavGroup } from "@/components/layout/area-links";
import { useAuth } from "@/components/auth/auth-provider";
import { isPlatformAdminProfile } from "@/lib/auth-types";

/** Guarda de UI da seção; as páginas filhas só montam para ADMIN. Quem autoriza é /api/admin. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, configured } = useAuth();

  const isAdmin = isPlatformAdminProfile(profile);

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
    ...managementNavGroup(profile, pathname),
    ...areaLinksGroup(profile, "admin"),
  ];

  return <DashboardShell groups={groups}>{children}</DashboardShell>;
}
