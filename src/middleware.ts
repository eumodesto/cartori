import { NextRequest, NextResponse } from "next/server";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";
import { updateSession } from "@/lib/supabase/middleware";

const LEGACY_CERTIFICATE_PARAMS = ["certidao", "servico"] as const;
const PROTECTED_PREFIXES = ["/painel", "/operacao", "/admin"];
const CANONICAL_HOST = "interjuri.com.br";
/** Aliases *.vercel.app da produção: servem o mesmo site e não podem competir com o domínio. */
const PRODUCTION_VERCEL_HOSTS = new Set([
  "cartori.vercel.app",
  "cartori-cartori.vercel.app",
  "cartori-git-main-cartori.vercel.app",
]);

/** Produção acessada por alias da Vercel → domínio canônico (previews seguem abertos). */
function canonicalHostRedirect(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (!PRODUCTION_VERCEL_HOSTS.has(host)) return null;
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

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
  const canonical = canonicalHostRedirect(request);
  if (canonical) return canonical;

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
