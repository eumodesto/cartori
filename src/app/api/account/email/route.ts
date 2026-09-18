import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { isValidEmail } from "@/lib/validators";

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
        { success: false, error: "Entre na conta para alterar o e-mail." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const body = await req.json().catch(() => ({}));
  const newEmail = String(body.email || "").trim().toLowerCase();
  const currentPassword = String(body.currentPassword || "");

  if (!isValidEmail(newEmail)) {
    return NextResponse.json(
      { success: false, error: "Informe um e-mail válido." },
      { status: 400 }
    );
  }

  const current = await prisma.user.findUnique({
    where: { id: auth.context.userId },
    select: { email: true },
  });
  if (!current?.email) {
    return NextResponse.json({ success: false, error: "Conta não encontrada." }, { status: 404 });
  }
  if (newEmail === current.email) {
    return NextResponse.json(
      { success: false, error: "Este já é o seu e-mail atual." },
      { status: 400 }
    );
  }

  // E-mail é identidade: garante unicidade no Prisma antes de iniciar a troca.
  const taken = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== auth.context.userId) {
    return NextResponse.json(
      { success: false, error: "Este e-mail já está em uso." },
      { status: 409 }
    );
  }

  // Verifica a senha atual (ação sensível) sem tocar na sessão.
  const { url, anonKey } = supabasePublicConfig();
  const verifier = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const check = await verifier.auth.signInWithPassword({
    email: current.email,
    password: currentPassword,
  });
  if (check.error) {
    return NextResponse.json(
      { success: false, error: "Senha atual incorreta." },
      { status: 400 }
    );
  }

  // Dispara a troca via Supabase (envia confirmação ao novo e-mail).
  const { supabase, json } = createRouteSupabase();
  const updated = await supabase.auth.updateUser({ email: newEmail });
  if (updated.error) {
    return json(
      { success: false, error: updated.error.message || "Não foi possível iniciar a troca de e-mail." },
      { status: 400 }
    );
  }

  return json({
    success: true,
    message:
      "Enviamos um link de confirmação para o novo e-mail. A troca é concluída após você confirmar por lá.",
  });
}
