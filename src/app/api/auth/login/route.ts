import { NextRequest, NextResponse } from "next/server";
import { syncAuthUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/validators";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Configure as chaves do Supabase para entrar." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!isValidEmail(email) || password.length < 8) {
    return NextResponse.json(
      { success: false, error: "Informe e-mail válido e senha com pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json(
      { success: false, error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  const profile = await syncAuthUser({
    authId: data.user.id,
    email: data.user.email || email,
    name: data.user.user_metadata?.name,
  });

  return NextResponse.json({ success: true, profile });
}
