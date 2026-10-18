import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { confirmUrl, generateAuthToken, sendAuthEmail } from "@/lib/auth-email-links";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeAppPath } from "@/lib/utils";
import { isValidEmail } from "@/lib/validators";


/**
 * Envia o link de redefinição de senha pelo Resend (o Supabase só gera o token).
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

  const token = await generateAuthToken({ type: "recovery", email });
  if (token.ok) {
    const profile = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    await sendAuthEmail({
      key: "auth_password_reset",
      to: email,
      userId: profile?.id,
      customerName: profile?.name || email,
      // O destino final é /redefinir-senha (a rota de confirmação leva até lá).
      actionLink: confirmUrl(req, token.tokenHash, "recovery", next),
    });
  } else if (token.reason !== "not_found") {
    // Não revela se a conta existe; registra para diagnóstico.
    console.warn("[auth] password_reset_request_failed", { reason: token.reason, message: token.message });
  }

  // O link vale em qualquer navegador (não depende mais do cookie PKCE deste).
  return Response.json({ success: true });
}
