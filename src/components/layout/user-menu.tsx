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
import {
  AUTH_INTENT_EVENT,
  COMPANY_DASHBOARD_PATH,
  isCompanySignupSearch,
  type AuthIntentDetail,
  type AuthIntentKind,
} from "@/lib/auth-intent";
import { cn, safeAppPath } from "@/lib/utils";

export const defaultUserMenuActions: QuickTooltipAction[] = [
  {
    id: "support",
    label: "Suporte",
    icon: <MessageCircle className="w-4 h-4" />,
    href: "/suporte",
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
  const { profile, isBusiness, loading, logout } = useAuth();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [authIntent, setAuthIntent] = React.useState<AuthIntentKind>("default");
  const [resolvedNext, setResolvedNext] = React.useState(nextPath);

  const openAuth = React.useCallback(
    (mode: "login" | "signup", intent: AuthIntentKind = "default") => {
      setAuthMode(mode);
      setAuthIntent(intent);
      setAuthOpen(true);
    },
    []
  );

  React.useEffect(() => {
    const onIntent = (event: Event) => {
      if (profile) return;
      const detail = (event as CustomEvent<AuthIntentDetail>).detail;
      openAuth(detail?.mode || "signup", detail?.intent || "default");
    };
    window.addEventListener(AUTH_INTENT_EVENT, onIntent);
    return () => window.removeEventListener(AUTH_INTENT_EVENT, onIntent);
  }, [openAuth, profile]);

  React.useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) setResolvedNext(safeAppPath(next, nextPath));
    if (isCompanySignupSearch(params)) {
      if (profile) {
        window.location.replace(isBusiness ? "/dashboard" : COMPANY_DASHBOARD_PATH);
        return;
      }
      openAuth("signup", "company");
      return;
    }
    if (params.get("entrar") === "1" && !profile) {
      openAuth("login");
    }
  }, [profile, isBusiness, loading, nextPath, openAuth]);

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
              openAuth("login");
            }
      }
    />
  );

  const dialogs = (
    <>
      <AuthDialog
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setAuthIntent("default");
        }}
        nextPath={resolvedNext}
        initialMode={authMode}
        intent={authIntent}
      />
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
