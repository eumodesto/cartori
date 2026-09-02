"use client";

import * as React from "react";
import { Building2, LayoutDashboard, LogOut, MessageCircle, PersonStanding, User, Users } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import {
  QuickTooltipActions,
  type QuickTooltipAction,
} from "@/components/ui/quick-tooltip-actions";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";

export const defaultUserMenuActions: QuickTooltipAction[] = [
  {
    id: "support",
    label: "Suporte",
    icon: <MessageCircle className="w-4 h-4" />,
    href: "/contato",
  },
  {
    id: "profile",
    label: "Perfil",
    icon: <PersonStanding className="w-4 h-4" />,
    href: "/minha-conta",
  },
  {
    id: "team",
    label: "Equipe",
    icon: <Users className="w-4 h-4" />,
    href: "/dashboard/equipe",
  },
];

export interface UserMenuProps {
  actions?: QuickTooltipAction[];
  side?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "md";
  className?: string;
  nextPath?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  actions,
  side = "bottom",
  size = "sm",
  className,
  nextPath = "/dashboard",
}) => {
  const { profile, logout, isPartner } = useAuth();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [partnerOpen, setPartnerOpen] = React.useState(false);
  const [resolvedNext, setResolvedNext] = React.useState(nextPath);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next?.startsWith("/")) setResolvedNext(next);
    if (params.get("entrar") === "1" && !profile) {
      setAuthMode("login");
      setAuthOpen(true);
    }
  }, [profile]);

  const loggedActions: QuickTooltipAction[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: "/dashboard",
    },
    {
      id: "support",
      label: "Suporte",
      icon: <MessageCircle className="w-4 h-4" />,
      href: "/#faq",
    },
    ...(!isPartner
      ? [
          {
            id: "partner",
            label: "Virar empresa parceira",
            icon: <Building2 className="w-4 h-4" />,
            onClick: () => setPartnerOpen(true),
          } satisfies QuickTooltipAction,
        ]
      : []),
    {
      id: "logout",
      label: "Sair",
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        logout().catch(() => undefined);
      },
    },
  ];

  const guestActions: QuickTooltipAction[] = [
    {
      id: "login",
      label: "Entrar",
      icon: <User className="w-4 h-4" />,
      onClick: () => {
        setAuthMode("login");
        setAuthOpen(true);
      },
    },
    {
      id: "signup",
      label: "Criar conta",
      icon: <User className="w-4 h-4" />,
      onClick: () => {
        setAuthMode("signup");
        setAuthOpen(true);
      },
    },
  ];

  return (
    <>
      <QuickTooltipActions
        triggerLabel={profile ? profile.name || profile.email : "Menu do usuário"}
        actions={actions || (profile ? loggedActions : guestActions)}
        side={side}
        className={className}
        trigger={
          <IconButton
            type="button"
            icon={<User className="w-4 h-4" />}
            aria-label="Menu do usuário"
            variant="outline"
            size={size}
            className="rounded-full"
          />
        }
      />
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        nextPath={resolvedNext}
        initialMode={authMode}
        onAuthenticated={({ wantsPartner }) => {
          if (wantsPartner) setPartnerOpen(true);
        }}
      />
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );
};
