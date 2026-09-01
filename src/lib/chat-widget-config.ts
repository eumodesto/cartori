export type ChatWidgetPhase = "closed" | "opening" | "open" | "closing";

export const chatWidgetConfig = {
  enabled: true,
  includedRoutes: [] as string[],
  excludedRoutes: ["/dashboard", "/design-system"],
};

export function isChatWidgetEnabled(pathname: string): boolean {
  const { enabled, includedRoutes, excludedRoutes } = chatWidgetConfig;
  if (!enabled) return false;

  const matches = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);

  if (excludedRoutes.some(matches)) return false;
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
