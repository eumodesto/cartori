import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const { url, anonKey } = supabasePublicConfig();
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: supabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !user) {
    const loginUrl = request.nextUrl.clone();
    if (loginUrl.hostname === "0.0.0.0") loginUrl.hostname = "localhost";
    loginUrl.pathname = "/";
    loginUrl.searchParams.set("entrar", "1");
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
