import { NextRequest } from "next/server";
import { syncAuthUser } from "@/lib/auth";
import { confirmAuthEmail, findAuthUserByEmail } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { isValidEmail } from "@/lib/validators";

function isUnconfirmedLogin(error: { message?: string; code?: string } | null) {
  const message = error?.message || "";
  const code = error?.code || "";
  return code === "email_not_confirmed" || /not confirmed/i.test(message);
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { success: false, error: "Configure as chaves do Supabase para entrar." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!isValidEmail(email) || password.length < 8) {
    return Response.json(
      { success: false, error: "Informe e-mail válido e senha com pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const { supabase, json } = createRouteSupabase();
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if ((!data.user || error) && isUnconfirmedLogin(error)) {
    const existing = await findAuthUserByEmail(email);
    if (existing?.id) {
      await confirmAuthEmail(existing.id);
      const retry = await supabase.auth.signInWithPassword({ email, password });
      data = retry.data;
      error = retry.error;
    }
  }

  if (error || !data.user) {
    return json({ success: false, error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const profile = await syncAuthUser({
    authId: data.user.id,
    email: data.user.email || email,
    name: data.user.user_metadata?.name,
  });

  return json({ success: true, profile });
}
