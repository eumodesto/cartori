export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return Boolean(
    url &&
      key &&
      !url.includes("your-project-id") &&
      !url.includes("placeholder") &&
      !key.includes("your-supabase") &&
      !key.includes("placeholder")
  );
}

export function supabasePublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}
