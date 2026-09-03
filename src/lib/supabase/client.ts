import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { supabaseAuthCookieOptions } from "@/lib/supabase/cookie-options";

export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase Auth não está configurado.");
  }
  const { url, anonKey } = supabasePublicConfig();
  return createBrowserClient(url, anonKey, {
    cookieOptions: supabaseAuthCookieOptions(),
  });
}
