"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Bell,
  CreditCard,
  FileText,
  FolderOpen,
  Inbox,
  Mail,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useAuth } from "@/components/auth/auth-provider";
import type { AccountAlert, AlertKind, AlertTone } from "@/lib/alert-rules";
import { isStaffProfile } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<AlertKind, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  status: FileText,
  payment: CreditCard,
  document: FileText,
  order: Inbox,
  stale: AlertTriangle,
  dossier: FolderOpen,
  email: Mail,
  signup: UserPlus,
};

const TONE_CLASS: Record<AlertTone, string> = {
  info: "bg-brand-50 text-brand-900",
  success: "bg-semantic-success-bg text-semantic-success",
  warning: "bg-semantic-warning-bg text-semantic-warning",
  error: "bg-semantic-error-bg text-semantic-error",
};

/** Antes o lido ficava no navegador; agora é do servidor. A chave antiga é apagada. */
const LEGACY_SEEN_KEY = "cartori.accountAlertsSeenAt";
const REFRESH_MS = 2 * 60 * 1000;

function formatAlertTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AccountAlerts() {
  const { profile } = useAuth();
  const isStaff = isStaffProfile(profile);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [alerts, setAlerts] = React.useState<AccountAlert[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [tab, setTab] = React.useState<"customer" | "staff">("customer");
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      window.localStorage.removeItem(LEGACY_SEEN_KEY);
    } catch {
      // armazenamento bloqueado: nada a limpar
    }
  }, []);

  React.useEffect(() => {
    if (isStaff) setTab("staff");
  }, [isStaff]);

  const apply = (data: { success?: boolean; alerts?: unknown; unread?: unknown } | null) => {
    if (!data?.success || !Array.isArray(data.alerts)) return false;
    setAlerts(data.alerts as AccountAlert[]);
    setUnread(typeof data.unread === "number" ? data.unread : 0);
    return true;
  };

  const load = React.useCallback(async () => {
    const res = await fetch("/api/account/alerts", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !apply(data)) {
      setAlerts([]);
      setUnread(0);
    }
  }, []);

  const markRead = React.useCallback(async (payload: { all: true } | { ids: string[] }) => {
    // Otimista: some o destaque na hora; o servidor devolve a lista atualizada.
    setAlerts((prev) =>
      prev.map((alert) => ("all" in payload || payload.ids.includes(alert.id) ? { ...alert, read: true } : alert))
    );
    setUnread((prev) => ("all" in payload ? 0 : Math.max(0, prev - payload.ids.length)));
    const res = await fetch("/api/account/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    if (res) apply(await res.json().catch(() => null));
  }, []);

  React.useEffect(() => {
    if (!profile) {
      setAlerts([]);
      setUnread(0);
      return;
    }
    load().catch(() => undefined);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load().catch(() => undefined);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load, profile]);

  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.right });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-account-alerts-panel]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!profile) return null;

  const staffAlerts = alerts.filter((alert) => alert.audience === "staff");
  const ownAlerts = alerts.filter((alert) => alert.audience === "customer");
  const shown = isStaff && tab === "staff" ? staffAlerts : ownAlerts;
  const unreadOf = (list: AccountAlert[]) => list.filter((alert) => !alert.read).length;

  const toggle = () => {
    setOpen((current) => {
      if (!current) load().catch(() => undefined);
      return !current;
    });
  };

  const panel =
    open && coords ? (
      <div
        role="menu"
        aria-label="Mensagens e alertas"
        data-account-alerts-panel=""
        style={{ position: "fixed", top: coords.top, left: coords.left, transform: "translateX(-100%)" }}
        className="z-[80] w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-neutral-0 border border-neutral-200 shadow-lg overflow-hidden"
      >
        <div className="px-3 py-2.5 border-b border-neutral-200 bg-neutral-50/70 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-neutral-900">Mensagens e alertas</p>
            <p className="text-[11px] text-neutral-500">
              {isStaff ? "Fila da equipe e os seus pedidos." : "Status, recados e documentos das suas solicitações."}
            </p>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markRead({ all: true })}
              className="shrink-0 text-[11px] font-semibold text-brand-800 hover:underline"
            >
              Marcar todos como lidos
            </button>
          )}
        </div>

        {isStaff && (
          <div className="flex gap-1 border-b border-neutral-200 px-2 py-1.5" role="tablist">
            {(
              [
                { id: "staff", label: "Equipe", list: staffAlerts },
                { id: "customer", label: "Meus pedidos", list: ownAlerts },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                  tab === item.id ? "bg-brand-950 text-neutral-0" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {item.label}
                {unreadOf([...item.list]) > 0 && ` (${unreadOf([...item.list])})`}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <p className="px-3 py-6 text-xs text-neutral-500 text-center">Nenhum alerta no momento.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {shown.map((alert) => {
              const Icon = KIND_ICON[alert.kind] ?? FileText;
              return (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    role="menuitem"
                    onClick={() => {
                      if (!alert.read) markRead({ ids: [alert.id] });
                      setOpen(false);
                    }}
                    className={cn(
                      "flex gap-2.5 px-3 py-2.5 hover:bg-neutral-50 transition-colors",
                      !alert.read && "bg-brand-50/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                        TONE_CLASS[alert.tone]
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-xs text-neutral-900 truncate",
                            alert.read ? "font-medium" : "font-semibold"
                          )}
                        >
                          {alert.title}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-neutral-400">{formatAlertTime(alert.createdAt)}</span>
                          {!alert.read && (
                            <span className="h-2 w-2 rounded-full bg-primary-500" aria-label="Não lido" />
                          )}
                        </span>
                      </span>
                      {alert.protocol && (
                        <span className="block text-[11px] text-neutral-500 font-mono truncate">
                          {alert.protocol}
                        </span>
                      )}
                      <span className="block text-xs text-neutral-600 leading-snug mt-0.5">{alert.body}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    ) : null;

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <IconButton
        type="button"
        icon={<Bell className="w-4 h-4" />}
        aria-label={unread > 0 ? `Alertas, ${unread} não lidos` : "Mensagens e alertas"}
        aria-expanded={open}
        aria-haspopup="menu"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={toggle}
      />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[10px] font-extrabold flex items-center justify-center pointer-events-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
