import { NextRequest } from "next/server";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { isAuthLinkType } from "@/lib/auth-email-links";
import { completePendingCompany } from "@/lib/pending-company";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { safeAppPath } from "@/lib/utils";

const INVALID = "Este link expirou ou já foi usado. Peça um novo.";

/**
 * Valida o token dos e-mails de acesso (enviados pelo Resend) e abre a sessão neste navegador.
 * POST de propósito: só o clique da pessoa gasta o token, não o robô que pré-abre links.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`auth-confirm:${clientIp(req)}`, 20, 15 * 60 * 1000);
  if (!limit.ok) {
    return Response.json({ success: false, error: "Muitas tentativas. Espere alguns minutos." }, { status: 429 });
  }
  if (!isSupabaseConfigured()) {
    return Response.json({ success: false, error: "Autenticação não configurada." }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const tokenHash = String(body.token_hash || "");
  const type = body.type;
  const next = safeAppPath(String(body.next || ""), "/painel");
  if (!tokenHash || tokenHash.length > 200 || !isAuthLinkType(type)) {
    return Response.json({ success: false, error: INVALID }, { status: 400 });
  }

  const { supabase, json } = createRouteSupabase();
  const verified = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  const user = verified.data.user;
  if (verified.error || !user?.email) {
    return json({ success: false, error: INVALID }, { status: 400 });
  }

  try {
    const meta = user.user_metadata ?? {};
    await syncAuthUser({
      authId: user.id,
      email: user.email,
      name: typeof meta.name === "string" ? meta.name : undefined,
      phone: typeof meta.phone === "string" ? meta.phone : undefined,
      cpf: typeof meta.cpf === "string" ? meta.cpf : undefined,
    });
    if (type === "signup" || type === "magiclink") await completePendingCompany(supabase, user);
  } catch (error) {
    if (error instanceof IdentityConflictError) {
      console.warn("[auth] identity_conflict", { reason: error.reason, source: "email_confirm" });
      await supabase.auth.signOut();
      return json({ success: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  // Recuperação: segue para criar a senha; os demais, para o destino pedido.
  const redirect = type === "recovery" ? `/redefinir-senha?next=${encodeURIComponent(next)}` : `/pos-login?next=${encodeURIComponent(next)}`;
  return json({ success: true, redirect });
}
