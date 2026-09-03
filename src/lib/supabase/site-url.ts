import { NextRequest } from "next/server";

export function requestOrigin(request: NextRequest) {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const headerHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const protoHeader = request.headers.get("x-forwarded-proto");
  const proto = protoHeader || request.nextUrl.protocol.replace(":", "") || "http";
  const host = headerHost.replace(/^0\.0\.0\.0/, "localhost");

  if (host && !host.startsWith("0.0.0.0")) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }
  if (env) return env;
  return request.nextUrl.origin.replace("0.0.0.0", "localhost").replace(/\/$/, "");
}

export function cartoriAuthCallbackUrl(request: NextRequest, nextPath = "/dashboard") {
  const next = nextPath.startsWith("/") ? nextPath : "/dashboard";
  return `${requestOrigin(request)}/auth/callback?next=${encodeURIComponent(next)}`;
}
