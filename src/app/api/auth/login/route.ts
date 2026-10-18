import { recordLogin } from "@/lib/presence";
import { NextRequest } from "next/server";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { completePendingCompany } from "@/lib/pending-company";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validators";

function isUnconfirmedLogin(error: { message?: string; code?: string } | null) {
  const message = error?.message || "";
  const code = error?.code || "";
  return code === "email_not_confirmed" || /not confirmed/i.test(message);
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`login:${clientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { success: false, error: "Muitas tentativas de entrada. Espere alguns minutos." },
      { status: 429 }
    );
  }

  if (!isSupabaseConfigured()) {
    return Response.json(
      { success: false, error: "Configure as chaves do Supabase para entrar." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!isValidEmail(email) || !password) {
    return Response.json(
      { success: false, error: "Informe e-mail válido e a senha." },
      { status: 400 }
    );
  }

  const { supabase, json } = createRouteSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (isUnconfirmedLogin(error)) {
    return json(
      {
        success: false,
        needsConfirmation: true,
        message: "Confirme o e-mail antes de entrar. O link está na sua caixa de entrada.",
      },
      { status: 403 }
    );
  }

  if (error || !data.user) {
    return json({ success: false, error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  try {
    const profile = await syncAuthUser({
      authId: data.user.id,
      email: data.user.email || email,
      name: typeof data.user.user_metadata?.name === "string"
        ? data.user.user_metadata.name
        : undefined,
    });
    await completePendingCompany(supabase, data.user);
    await recordLogin(profile.id);
    return json({ success: true, profile });
  } catch (syncError) {
    if (syncError instanceof IdentityConflictError) {
      return json({ success: false, error: syncError.message }, { status: syncError.status });
    }
    throw syncError;
  }
}
