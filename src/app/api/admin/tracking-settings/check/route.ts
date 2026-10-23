import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/authorization";
import { checkPublishedTags } from "@/lib/tracking";
import { getTrackingConfigFresh } from "@/lib/tracking-settings";

export const dynamic = "force-dynamic";

// URL fixa do servidor: o destino nunca vem do browser.
function siteUrl(): string {
  return `${(process.env.NEXT_PUBLIC_SITE_URL || "https://interjuri.com.br").replace(/\/$/, "")}/`;
}

export async function GET() {
  const gate = await requirePlatformAdmin("admin.tracking");
  if (!gate.ok) return gate.response;

  const config = await getTrackingConfigFresh();
  const url = siteUrl();

  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "InterJuri-TagCheck/1.0" },
    });
    if (!res.ok) {
      return NextResponse.json({
        success: false,
        siteUrl: url,
        error: `O site respondeu ${res.status}.`,
      });
    }
    const html = await res.text();
    const csp = res.headers.get("content-security-policy") || "";
    return NextResponse.json({
      success: true,
      siteUrl: url,
      enabled: config.enabled,
      checks: checkPublishedTags(html, csp, config),
    });
  } catch {
    return NextResponse.json({
      success: false,
      siteUrl: url,
      error: "Não foi possível acessar o site para verificar.",
    });
  }
}
