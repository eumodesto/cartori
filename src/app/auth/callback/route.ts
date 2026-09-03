import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";
import { requestOrigin } from "@/lib/supabase/site-url";
import { safeAppPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = requestOrigin(request);
  const code = searchParams.get("code");
  const next = safeAppPath(searchParams.get("next") || "/dashboard");

  if (!code || !isSupabaseConfigured()) {
    const fallback = new URL("/", origin);
    fallback.searchParams.set("entrar", "1");
    fallback.searchParams.set("next", next);
    return NextResponse.redirect(fallback);
  }

  const redirect = NextResponse.redirect(new URL(next, origin));
  const { url, anonKey } = supabasePublicConfig();
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: supabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const fallback = new URL("/", origin);
    fallback.searchParams.set("entrar", "1");
    fallback.searchParams.set("next", next);
    return NextResponse.redirect(fallback);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    try {
      await syncAuthUser({
        authId: user.id,
        email: user.email,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : undefined,
      });
    } catch (error) {
      if (error instanceof IdentityConflictError) {
        console.warn("[auth] identity_conflict", { reason: error.reason, source: "oauth_callback" });
        const fallback = new URL("/", origin);
        fallback.searchParams.set("entrar", "1");
        fallback.searchParams.set("next", next);
        return NextResponse.redirect(fallback);
      }
      throw error;
    }
  }

  return redirect;
}
