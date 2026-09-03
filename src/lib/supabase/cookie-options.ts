export function supabaseAuthCookieOptions() {
  return {
    name: "sb-cartori-auth-token",
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
