"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, PersonStanding, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { UserMenu } from "@/components/layout/user-menu";
import { isPlatformAdminProfile } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

type MenuEntry = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
};

function initialsOf(value: string) {
  return (
    value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CT"
  );
}

/** Avatar + nome no rodapé do sidebar; o menu abre ao passar o mouse (ou ao clicar/tocar). */
export function SidebarUserMenu({ collapsed }: { collapsed: boolean }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>();

  const show = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const scheduleHide = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  if (!profile) {
    return <UserMenu side={collapsed ? "right" : "top"} size="sm" />;
  }

  const displayName = profile.name?.trim() || profile.email;

  const entries: MenuEntry[] = [
    {
      id: "profile",
      label: "Meu perfil",
      icon: <PersonStanding className="w-4 h-4" />,
      href: "/painel/perfil",
    },
    ...(isPlatformAdminProfile(profile)
      ? [
          {
            id: "settings",
            label: "Configurações",
            icon: <Settings className="w-4 h-4" />,
            href: "/admin/configuracoes",
          },
        ]
      : []),
    {
      id: "logout",
      label: "Sair",
      icon: <LogOut className="w-4 h-4" />,
      destructive: true,
      onClick: () => {
        logout().catch(() => undefined);
      },
    },
  ];

  const itemClass = (destructive?: boolean) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
      destructive
        ? "text-semantic-error hover:bg-semantic-error-bg"
        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
    );

  return (
    <div
      ref={containerRef}
      className={cn("relative", collapsed ? "flex justify-center" : "flex-1 min-w-0")}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocusCapture={show}
      onBlurCapture={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) scheduleHide();
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu de ${displayName}`}
        title={collapsed ? displayName : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 hover:bg-neutral-200/70 dark:hover:bg-white/10",
          collapsed ? "p-1" : "w-full gap-2.5 px-1.5 py-1.5 text-left"
        )}
      >
        <span className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-950 font-bold text-[11px] shrink-0 overflow-hidden">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initialsOf(displayName)
          )}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {displayName}
            </span>
            {profile.name?.trim() && (
              <span className="block truncate text-[10px] text-neutral-500">{profile.email}</span>
            )}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Menu de ${displayName}`}
          className={cn(
            "absolute z-50 w-56 rounded-lg border border-neutral-200 bg-neutral-0 p-1 shadow-md animate-in fade-in duration-fast",
            collapsed ? "left-full bottom-0 ml-2" : "bottom-full left-0 mb-2"
          )}
        >
          <div className="px-2.5 py-2 border-b border-neutral-100 mb-1">
            <p className="truncate text-xs font-semibold text-neutral-900">{displayName}</p>
            <p className="truncate text-[10px] text-neutral-500">{profile.email}</p>
          </div>
          {entries.map((entry) =>
            entry.href ? (
              <Link
                key={entry.id}
                href={entry.href}
                role="menuitem"
                className={itemClass(entry.destructive)}
                onClick={() => setOpen(false)}
              >
                {entry.icon}
                {entry.label}
              </Link>
            ) : (
              <button
                key={entry.id}
                type="button"
                role="menuitem"
                className={itemClass(entry.destructive)}
                onClick={() => {
                  setOpen(false);
                  entry.onClick?.();
                }}
              >
                {entry.icon}
                {entry.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
