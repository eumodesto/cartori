import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
