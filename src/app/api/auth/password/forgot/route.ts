import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { cartoriAuthCallbackUrl } from "@/lib/supabase/site-url";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeAppPath } from "@/lib/utils";
import { isValidEmail } from "@/lib/validators";

const RESET_PASSWORD_PATH = "/redefinir-senha";

/**
 * Envia o link de redefinição de senha (Supabase Auth).
 * Resposta é sempre a mesma para e-mail existente ou não (sem enumeração de contas).
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`password-forgot:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { success: false, error: "Muitas tentativas. Espere alguns minutos e tente de novo." },
      { status: 429 }
    );
  }
  if (!isSupabaseConfigured()) {
    return Response.json(
      { success: false, error: "Autenticação não configurada." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String((body as { email?: unknown }).email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return Response.json({ success: false, error: "Informe um e-mail válido." }, { status: 400 });
  }
  const next = safeAppPath(String((body as { next?: unknown }).next || ""), "/painel");

  const { supabase, json } = createRouteSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: cartoriAuthCallbackUrl(
      req,
      `${RESET_PASSWORD_PATH}?next=${encodeURIComponent(next)}`
    ),
  });
  if (error) {
    // Não revela se a conta existe; registra para diagnóstico (limite de envio, URL não liberada…).
    console.warn("[auth] password_reset_request_failed", { message: error.message });
  }

  // json() devolve os cookies do PKCE: o link precisa ser aberto neste navegador.
  return json({ success: true });
}
