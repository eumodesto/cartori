import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Autenticação não configurada." },
      { status: 503 }
    );
  }

  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para alterar a senha." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: "A nova senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.context.userId },
    select: { email: true },
  });
  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: "Conta não encontrada." },
      { status: 404 }
    );
  }

  // Verifica a senha atual sem tocar na sessão (cliente efêmero).
  const { url, anonKey } = supabasePublicConfig();
  const verifier = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const check = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (check.error) {
    return NextResponse.json(
      { success: false, error: "Senha atual incorreta." },
      { status: 400 }
    );
  }

  const { supabase, json } = createRouteSupabase();
  const updated = await supabase.auth.updateUser({ password: newPassword });
  if (updated.error) {
    return json(
      { success: false, error: updated.error.message || "Não foi possível alterar a senha." },
      { status: 400 }
    );
  }

  return json({ success: true });
}
