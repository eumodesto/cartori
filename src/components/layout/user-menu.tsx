"use client";

import * as React from "react";
import { MessageCircle, PersonStanding, User, Users } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import {
  QuickTooltipActions,
  type QuickTooltipAction,
} from "@/components/ui/quick-tooltip-actions";

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
}

export const UserMenu: React.FC<UserMenuProps> = ({
  actions = defaultUserMenuActions,
  side = "bottom",
  size = "sm",
  className,
}) => {
  return (
    <QuickTooltipActions
      triggerLabel="Menu do usuário"
      actions={actions}
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
  );
};
