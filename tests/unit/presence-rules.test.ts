import { describe, expect, it } from "vitest";
import { formatLoginDate, isOnline, timeAgo } from "@/lib/presence-rules";

describe("presença", () => {
  const now = new Date("2026-10-19T15:00:00Z");

  it("Online = visto nos últimos 5 minutos", () => {
    expect(isOnline(new Date(now.getTime() - 4 * 60 * 1000), now)).toBe(true);
    expect(isOnline(new Date(now.getTime() - 6 * 60 * 1000), now)).toBe(false);
    expect(isOnline(null, now)).toBe(false);
  });

  it("data do login no fuso de São Paulo", () => {
    expect(formatLoginDate("2026-10-19T15:08:00Z")).toBe("19/10/2026 às 12:08");
  });

  it("tempo relativo", () => {
    expect(timeAgo(new Date(now.getTime() - 30 * 1000), now)).toBe("agora");
    expect(timeAgo(new Date(now.getTime() - 12 * 60 * 1000), now)).toBe("há 12 min");
    expect(timeAgo(new Date(now.getTime() - 3 * 60 * 60 * 1000), now)).toBe("há 3 h");
    expect(timeAgo(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), now)).toBe("há 2 dias");
  });
});
