import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return Response.json({ success: true });
  }
  const { supabase, json } = createRouteSupabase();
  await supabase.auth.signOut();
  return json({ success: true });
}
