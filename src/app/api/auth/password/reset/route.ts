import { NextRequest } from "next/server";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRouteSupabase } from "@/lib/supabase/route";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE } from "@/lib/validators";

/** Janela em que a sessão aberta pelo link de recuperação pode definir senha sem a senha atual. */
const RECOVERY_WINDOW_MS = 60 * 60 * 1000;

/**
 * Define a nova senha depois do link de recuperação.
 * Exige sessão válida E pedido de recuperação recente (recovery_sent_at); fora disso,
 * a troca de senha continua em /api/account/password, que pede a senha atual.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`password-reset:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { success: false, error: "Muitas tentativas. Espere alguns minutos." },
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
  const password = String((body as { password?: unknown }).password || "");
  const confirmPassword = String((body as { confirmPassword?: unknown }).confirmPassword || "");
  if (password.length < PASSWORD_MIN_LENGTH) {
    return Response.json(
      { success: false, error: PASSWORD_MIN_MESSAGE },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return Response.json({ success: false, error: "As senhas não conferem." }, { status: 400 });
  }

  const { supabase, json } = createRouteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sentAt = user?.recovery_sent_at ? Date.parse(user.recovery_sent_at) : NaN;
  // Link do Resend: a sessão nasce do token de recuperação (método "recovery" no login atual).
  const aal = user ? await supabase.auth.mfa.getAuthenticatorAssuranceLevel() : null;
  const recoveryLogin = (aal?.data?.currentAuthenticationMethods ?? []).some(
    (item) =>
      typeof item === "object" &&
      item.method === "recovery" &&
      Date.now() - item.timestamp * 1000 <= RECOVERY_WINDOW_MS
  );
  const recentRequest = Number.isFinite(sentAt) && Date.now() - sentAt <= RECOVERY_WINDOW_MS;
  if (!user || (!recoveryLogin && !recentRequest)) {
    return json(
      {
        success: false,
        expired: true,
        error: "O link de recuperação expirou. Peça um novo link.",
      },
      { status: 401 }
    );
  }

  const updated = await supabase.auth.updateUser({ password });
  if (updated.error) {
    return json(
      { success: false, error: authErrorMessage(updated.error.message, "Não foi possível salvar a nova senha.") },
      { status: 400 }
    );
  }
  return json({ success: true });
}
