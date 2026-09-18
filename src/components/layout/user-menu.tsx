"use client";

import * as React from "react";
import { LogOut, MessageCircle, PersonStanding, User, UserRound, Users } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  QuickTooltipActions,
  type QuickTooltipAction,
} from "@/components/ui/quick-tooltip-actions";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { cn, safeAppPath } from "@/lib/utils";

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
    href: "/dashboard",
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
  const { profile, logout } = useAuth();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [partnerOpen, setPartnerOpen] = React.useState(false);
  const [resolvedNext, setResolvedNext] = React.useState(nextPath);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) setResolvedNext(safeAppPath(next, nextPath));
    if (params.get("entrar") === "1" && !profile) {
      setAuthOpen(true);
    }
  }, [profile, nextPath]);

  const trigger = (
    <IconButton
      type="button"
      icon={<User className="w-4 h-4" />}
      aria-label={profile ? "Minha conta" : "Entrar"}
      variant="outline"
      size={size}
      className="rounded-full"
      onClick={
        profile || actions
          ? undefined
          : () => {
              setAuthOpen(true);
            }
      }
    />
  );

  const dialogs = (
    <>
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        nextPath={resolvedNext}
        initialMode="login"
        onAuthenticated={({ wantsPartner }) => {
          if (wantsPartner) setPartnerOpen(true);
        }}
      />
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );

  if (actions) {
    return (
      <>
        <QuickTooltipActions
          triggerLabel={profile ? profile.name || profile.email : "Menu do usuário"}
          actions={actions}
          side={side}
          className={className}
          trigger={trigger}
        />
        {dialogs}
      </>
    );
  }

  if (!profile) {
    return (
      <div className={cn("inline-flex", className)}>
        {trigger}
        {dialogs}
      </div>
    );
  }

  return (
    <>
      <div className={cn("inline-flex", className)}>
        <DropdownMenu
          align="right"
          trigger={trigger}
          items={[
            {
              id: "account",
              label: "Minha conta",
              icon: <UserRound className="w-4 h-4" />,
              href: "/dashboard",
            },
            "separator",
            {
              id: "logout",
              label: "Sair",
              icon: <LogOut className="w-4 h-4" />,
              destructive: true,
              onClick: () => {
                logout().catch(() => undefined);
              },
            },
          ]}
        />
      </div>
      {dialogs}
    </>
  );
};
