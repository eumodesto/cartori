import { NextRequest } from "next/server";
import { syncAuthUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createRouteSupabase } from "@/lib/supabase/route";
import { isValidCpf, isValidEmail, isValidPhone } from "@/lib/validators";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
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
    return Response.json({ success: false, error: "Informe o nome completo." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ success: false, error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json(
      { success: false, error: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (phone && !isValidPhone(phone)) {
    return Response.json({ success: false, error: "Telefone inválido." }, { status: 400 });
  }
  if (cpf && !isValidCpf(cpf)) {
    return Response.json({ success: false, error: "CPF inválido." }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return Response.json(
      { success: false, error: "Configure SUPABASE_SERVICE_ROLE_KEY para criar a conta." },
      { status: 503 }
    );
  }

  const { supabase, json } = createRouteSupabase();
  const userPayload = {
    email,
    password,
    email_confirm: true,
    user_metadata: { name, app: "cartori" },
  };

  const created = await admin.auth.admin.createUser(userPayload);

  if (created.error || !created.data.user) {
    const already = /already|registered|exists/i.test(created.error?.message || "");
    if (!already) {
      const recovered = await supabase.auth.signInWithPassword({ email, password });
      if (recovered.data.user) {
        const profile = await syncAuthUser({
          authId: recovered.data.user.id,
          email,
          name,
          phone,
          cpf,
        });
        return json({ success: true, profile });
      }
    }
    const message = already
      ? "Este e-mail já tem uma conta. Entre para continuar."
      : /fetch failed/i.test(created.error?.message || "")
        ? "Não foi possível criar a conta agora. Tente de novo em alguns segundos."
        : created.error?.message || "Não foi possível criar a conta.";
    return json({ success: false, error: message }, { status: 400 });
  }

  const signedIn = await supabase.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.user) {
    return json(
      { success: false, error: "Conta criada, mas não foi possível entrar. Use a aba Entrar." },
      { status: 400 }
    );
  }

  const profile = await syncAuthUser({
    authId: signedIn.data.user.id,
    email,
    name,
    phone,
    cpf,
  });

  return json({ success: true, profile });
}
