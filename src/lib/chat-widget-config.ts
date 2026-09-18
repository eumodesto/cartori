import type { UserRole } from "@prisma/client";

export type ChatWidgetPhase = "closed" | "opening" | "open" | "closing";

export const chatWidgetConfig = {
  enabled: true,
  includedRoutes: [] as string[],
  /** Mesa operacional, administração e telas de design — não o painel do cliente. */
  excludedRoutes: ["/operacao", "/admin", "/design-system"],
};

export function isStaffChatAudience(role?: UserRole | string | null) {
  return role === "ADMIN" || role === "OPERATOR";
}

export function isChatWidgetEnabled(
  pathname: string,
  context?: { platformRole?: UserRole | string | null; authLoading?: boolean }
): boolean {
  const { enabled, includedRoutes, excludedRoutes } = chatWidgetConfig;
  if (!enabled) return false;

  const matches = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);

  if (excludedRoutes.some(matches)) return false;
  if (isStaffChatAudience(context?.platformRole)) return false;
  if (
    context?.authLoading &&
    (pathname.startsWith("/painel") ||
      pathname.startsWith("/operacao") ||
      pathname.startsWith("/admin"))
  )
    return false;
  if (includedRoutes.length === 0) return true;
  return includedRoutes.some(matches);
}

export const ASSISTANT_ASSETS = {
  webm: "/assistant/amanda-wave.webm",
  mp4: "/assistant/amanda-wave.mp4",
  poster: "/amanda.png",
  fallback: "/amanda.png",
} as const;

export const LAUNCHER_POSITION_KEY = "cartori_amanda_launcher_pos";

export type LauncherPosition = {
  x: number;
  y: number;
};

export function clampLauncherPosition(
  x: number,
  y: number,
  width: number,
  height: number
): LauncherPosition {
  const margin = window.innerWidth >= 768 ? 24 : 12;
  const maxX = window.innerWidth - width - margin;
  const maxY = window.innerHeight - height - margin;
  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, maxX)),
    y: Math.min(Math.max(margin, y), Math.max(margin, maxY)),
  };
}

export function readLauncherPosition(): LauncherPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAUNCHER_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LauncherPosition;
    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLauncherPosition(position: LauncherPosition): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAUNCHER_POSITION_KEY, JSON.stringify(position));
}
