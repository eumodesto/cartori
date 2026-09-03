import { createClient, type User } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/lib/supabase/config";

function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function createAdminSupabase() {
  const { url } = supabasePublicConfig();
  const key = serviceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminSupabase();
  if (!admin) return null;
  const normalized = email.trim().toLowerCase();

  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;
    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < 200) return null;
  }

  return null;
}

export async function confirmAuthEmail(userId: string) {
  const admin = createAdminSupabase();
  if (!admin) return { error: new Error("Supabase admin não configurado.") };
  return admin.auth.admin.updateUserById(userId, { email_confirm: true });
}

export async function deleteAuthUser(userId: string) {
  const admin = createAdminSupabase();
  if (!admin) return { error: new Error("Supabase admin não configurado.") };
  return admin.auth.admin.deleteUser(userId);
}
