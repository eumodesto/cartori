import { NextRequest, NextResponse } from "next/server";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";
import { updateSession } from "@/lib/supabase/middleware";

const LEGACY_CERTIFICATE_PARAMS = ["certidao", "servico"] as const;
const PROTECTED_PREFIXES = ["/painel", "/operacao", "/admin"];

/** Links antigos da home (/?certidao=slug) → página real da certidão (a home fica estática). */
function legacyCertificateRedirect(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return null;
  for (const key of LEGACY_CERTIFICATE_PARAMS) {
    const raw = request.nextUrl.searchParams.get(key)?.trim();
    if (raw && /^[a-z0-9-]{2,120}$/i.test(raw)) {
      const url = request.nextUrl.clone();
      url.pathname = `/certidao/${raw.toLowerCase()}`;
      url.search = "";
      return NextResponse.redirect(url, 308);
    }
  }
  return null;
}

function hasAuthCookie(request: NextRequest) {
  const name = supabaseAuthCookieOptions().name;
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith(name));
}

export async function middleware(request: NextRequest) {
  const legacy = legacyCertificateRedirect(request);
  if (legacy) return legacy;

  // Visitante sem sessão (anúncio, busca, robô): nada a renovar; páginas públicas seguem direto.
  // Áreas privadas continuam passando por updateSession, que redireciona para o login.
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (!isProtected && !hasAuthCookie(request)) return NextResponse.next();

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|otf|woff|woff2|ttf)$).*)",
  ],
};
