import { Inbox, Layers, Mail, Settings, UserCog } from "lucide-react";
import type { NavGroup, NavItem } from "@/components/layout/app-sidebar";
import { type AdminPermission, hasAdminPermission } from "@/lib/admin-permissions";
import { type AuthProfile, isStaffProfile } from "@/lib/auth-types";

export type AppArea = "painel" | "operacao" | "admin";

function can(profile: AuthProfile, permission: AdminPermission) {
  return hasAdminPermission(profile.role, profile.staffPermissions ?? [], permission);
}

/**
 * Menu único de gestão para /operacao e /admin: as rotas e os gates seguem separados
 * (OPERATOR só vê Pedidos), mas o administrador navega por uma área só. Quem autoriza é o servidor.
 */
export function managementNavGroup(
  profile: AuthProfile | null | undefined,
  pathname: string
): NavGroup[] {
  if (!profile || !isStaffProfile(profile)) return [];
  const items: NavItem[] = [
    {
      id: "orders",
      label: "Pedidos",
      href: "/operacao/pedidos",
      icon: <Inbox className="w-4 h-4" />,
      isActive: pathname.startsWith("/operacao"),
    },
  ];
  if (can(profile, "users")) {
    items.push({
      id: "users",
      label: "Usuários",
      href: "/admin/usuarios",
      icon: <UserCog className="w-4 h-4" />,
      isActive: pathname.startsWith("/admin/usuarios"),
    });
  }
  if (can(profile, "emails")) {
    items.push({
      id: "emails",
      label: "E-mails",
      href: "/admin/emails",
      icon: <Mail className="w-4 h-4" />,
      isActive: pathname.startsWith("/admin/emails"),
    });
  }
  if (can(profile, "settings")) {
    items.push({
      id: "settings",
      label: "Configurações",
      href: "/admin/configuracoes",
      icon: <Settings className="w-4 h-4" />,
      isActive: pathname.startsWith("/admin/configuracoes"),
    });
  }
  return [{ label: "Gestão", items }];
}

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
  // /operacao e /admin formam uma área só (Gestão); do painel, um atalho leva a ela.
  if (current === "painel" && isStaffProfile(profile)) {
    items.push({
      id: "area-gestao",
      label: "Gestão",
      href: "/operacao/pedidos",
      icon: <Inbox className="w-4 h-4" />,
      isActive: false,
    });
  }

  return items.length ? [{ label: "Outras áreas", items }] : [];
}
