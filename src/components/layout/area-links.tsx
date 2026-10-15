import { Inbox, Layers, UserCog } from "lucide-react";
import type { NavGroup, NavItem } from "@/components/layout/app-sidebar";
import {
  type AuthProfile,
  isPlatformAdminProfile,
  isStaffProfile,
} from "@/lib/auth-types";

export type AppArea = "painel" | "operacao" | "admin";

/** Atalhos para as outras áreas que o papel alcança. Só navegação: quem autoriza é o servidor. */
export function areaLinksGroup(
  profile: AuthProfile | null | undefined,
  current: AppArea
): NavGroup[] {
  const items: NavItem[] = [];

  if (current !== "painel") {
    items.push({
      id: "area-painel",
      label: "Meu painel",
      href: "/painel",
      icon: <Layers className="w-4 h-4" />,
      isActive: false,
    });
  }
  if (current !== "operacao" && isStaffProfile(profile)) {
    items.push({
      id: "area-operacao",
      label: "Mesa operacional",
      href: "/operacao/pedidos",
      icon: <Inbox className="w-4 h-4" />,
      isActive: false,
    });
  }
  if (current !== "admin" && isPlatformAdminProfile(profile)) {
    items.push({
      id: "area-admin",
      label: "Administração",
      href: "/admin/usuarios",
      icon: <UserCog className="w-4 h-4" />,
      isActive: false,
    });
  }

  return items.length ? [{ label: "Outras áreas", items }] : [];
}
