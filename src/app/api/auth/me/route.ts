import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      configured: false,
      profile: null,
    });
  }

  const profile = await getAuthProfile();
  return NextResponse.json({
    success: true,
    configured: true,
    profile,
  });
}
