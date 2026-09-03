import { NextRequest } from "next/server";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminSupabase, deleteAuthUser } from "@/lib/supabase/admin";
import { createRouteSupabase } from "@/lib/supabase/route";
import { prisma } from "@/lib/prisma";
import { isValidCpf, isValidEmail, isValidPhone, normalizeCpf } from "@/lib/validators";

const CPF_CONFLICT = "Já existe uma conta associada a este CPF.";

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
  const cpfRaw = String(body.cpf || "");
  const cpf = cpfRaw ? normalizeCpf(cpfRaw) : "";

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
  if (cpfRaw && !isValidCpf(cpfRaw)) {
    return Response.json({ success: false, error: "CPF inválido." }, { status: 400 });
  }

  if (cpf) {
    const taken = await prisma.user.findUnique({
      where: { cpf },
      select: { id: true },
    });
    if (taken) {
      return Response.json({ success: false, error: CPF_CONFLICT }, { status: 409 });
    }
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
  const createdAuthId =
    !created.error && created.data.user?.id ? created.data.user.id : null;

  if (created.error || !created.data.user) {
    const already = /already|registered|exists/i.test(created.error?.message || "");
    if (!already) {
      const recovered = await supabase.auth.signInWithPassword({ email, password });
      if (recovered.data.user) {
        try {
          const profile = await syncAuthUser({
            authId: recovered.data.user.id,
            email: recovered.data.user.email || email,
            name,
            phone,
            cpf,
          });
          return json({ success: true, profile });
        } catch (error) {
          if (error instanceof IdentityConflictError) {
            return json({ success: false, error: error.message }, { status: error.status });
          }
          throw error;
        }
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
    if (createdAuthId) await deleteAuthUser(createdAuthId);
    return json(
      { success: false, error: "Conta criada, mas não foi possível entrar. Use a aba Entrar." },
      { status: 400 }
    );
  }

  try {
    const profile = await syncAuthUser({
      authId: signedIn.data.user.id,
      email: signedIn.data.user.email || email,
      name,
      phone,
      cpf,
    });
    return json({ success: true, profile });
  } catch (error) {
    if (error instanceof IdentityConflictError) {
      await supabase.auth.signOut();
      if (createdAuthId) await deleteAuthUser(createdAuthId);
      return json({ success: false, error: error.message }, { status: error.status });
    }
    throw error;
  }
}
