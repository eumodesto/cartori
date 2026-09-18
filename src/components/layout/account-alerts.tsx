"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Bell, FileText, MessageSquare } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type AccountAlert = {
  id: string;
  type: "status" | "message";
  orderId: string;
  protocol: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

const SEEN_STORAGE_KEY = "cartori.accountAlertsSeenAt";

function formatAlertTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readSeenAt() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
  const value = raw ? Date.parse(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function AccountAlerts() {
  const { profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [alerts, setAlerts] = React.useState<AccountAlert[]>([]);
  const [seenAt, setSeenAt] = React.useState(0);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setSeenAt(readSeenAt());
  }, []);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/account/alerts", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success || !Array.isArray(data.alerts)) {
      setAlerts([]);
      return;
    }
    setAlerts(data.alerts);
  }, []);

  React.useEffect(() => {
    if (!profile) {
      setAlerts([]);
      return;
    }
    load().catch(() => setAlerts([]));
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

  const unread = alerts.filter((alert) => Date.parse(alert.createdAt) > seenAt).length;

  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next) {
        const now = new Date().toISOString();
        window.localStorage.setItem(SEEN_STORAGE_KEY, now);
        setSeenAt(Date.parse(now));
        load().catch(() => undefined);
      }
      return next;
    });
  };

  const panel =
    open && coords ? (
      <div
        role="menu"
        aria-label="Mensagens e alertas"
        data-account-alerts-panel=""
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: "translateX(-100%)",
        }}
        className="z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-xl bg-neutral-0 border border-neutral-200 shadow-lg overflow-hidden"
      >
        <div className="px-3 py-2.5 border-b border-neutral-200 bg-neutral-50/70">
          <p className="text-xs font-semibold text-neutral-900">Mensagens e alertas</p>
          <p className="text-[11px] text-neutral-500">Status e recados das suas solicitações.</p>
        </div>
        {alerts.length === 0 ? (
          <p className="px-3 py-6 text-xs text-neutral-500 text-center">
            Nenhum alerta no momento.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {alerts.map((alert) => {
              const Icon = alert.type === "message" ? MessageSquare : FileText;
              return (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex gap-2.5 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                        alert.type === "message"
                          ? "bg-brand-50 text-brand-900"
                          : "bg-amber-50 text-amber-800"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-neutral-900 truncate">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {formatAlertTime(alert.createdAt)}
                        </span>
                      </span>
                      <span className="block text-[11px] text-neutral-500 font-mono truncate">
                        {alert.protocol}
                      </span>
                      <span className="block text-xs text-neutral-600 leading-snug mt-0.5">
                        {alert.body}
                      </span>
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
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-primary-950 text-[10px] font-extrabold flex items-center justify-center pointer-events-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
