import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";
import { supabasePublicConfig } from "@/lib/supabase/config";

type PendingCookie = { name: string; value: string; options: CookieOptions };

export function createRouteSupabase() {
  const cookieStore = cookies();
  const pending: PendingCookie[] = [];
  const { url, anonKey } = supabasePublicConfig();

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: supabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options });
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Route handlers still attach cookies on the JSON response below.
          }
        });
      },
    },
  });

  return {
    supabase,
    json(body: unknown, init?: { status?: number }) {
      const response = NextResponse.json(body, { status: init?.status });
      pending.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    },
  };
}
