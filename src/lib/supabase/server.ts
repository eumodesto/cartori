import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export function createServerSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const cookieStore = cookies();
  const { url, anonKey } = supabasePublicConfig();

  return createServerClient(url, anonKey, {
    cookieOptions: supabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware refreshes the session.
        }
      },
    },
  });
}
