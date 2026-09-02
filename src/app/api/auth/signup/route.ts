import { NextRequest, NextResponse } from "next/server";
import { syncAuthUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidCpf, isValidEmail, isValidPhone } from "@/lib/validators";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Configure as chaves do Supabase para criar a conta." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "");
  const cpf = String(body.cpf || "");

  if (!name) {
    return NextResponse.json({ success: false, error: "Informe o nome completo." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { success: false, error: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ success: false, error: "Telefone inválido." }, { status: 400 });
  }
  if (cpf && !isValidCpf(cpf)) {
    return NextResponse.json({ success: false, error: "CPF inválido." }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    const message = /already/i.test(error.message)
      ? "Este e-mail já tem uma conta. Entre para continuar."
      : error.message;
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json(
      { success: false, error: "Não foi possível criar a conta." },
      { status: 400 }
    );
  }

  if (!data.session) {
    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error || !signedIn.data.user) {
      return NextResponse.json({
        success: true,
        needsConfirmation: true,
        profile: null,
        error: "Conta criada. Confirme o e-mail enviado pelo Supabase para entrar.",
      });
    }
  }

  const authUser = data.session ? data.user : (await supabase.auth.getUser()).data.user;
  if (!authUser) {
    return NextResponse.json({
      success: true,
      needsConfirmation: true,
      profile: null,
    });
  }

  const profile = await syncAuthUser({
    authId: authUser.id,
    email,
    name,
    phone,
    cpf,
  });

  return NextResponse.json({ success: true, profile });
}
