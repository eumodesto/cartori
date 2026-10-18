import type { NextRequest } from "next/server";
import { queueTemplateEmail } from "@/lib/email";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { requestOrigin } from "@/lib/supabase/site-url";
import { safeAppPath } from "@/lib/utils";

/**
 * E-mails de acesso (confirmar cadastro, redefinir senha, trocar e-mail) saem pelo Resend, com a
 * marca. O Supabase só gera o token (admin.generateLink não envia nada); o link aponta para
 * /auth/confirmar, que valida o token no servidor ao clicar no botão (robôs de antivírus que
 * abrem links não gastam o token).
 */

export const AUTH_LINK_TYPES = ["signup", "magiclink", "recovery", "email_change"] as const;
export type AuthLinkType = (typeof AUTH_LINK_TYPES)[number];

export function isAuthLinkType(value: unknown): value is AuthLinkType {
  return typeof value === "string" && (AUTH_LINK_TYPES as readonly string[]).includes(value);
}

export function confirmUrl(req: NextRequest, tokenHash: string, type: AuthLinkType, next: string) {
  const url = new URL("/auth/confirmar", requestOrigin(req));
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  url.searchParams.set("next", safeAppPath(next, "/painel"));
  return url.toString();
}

type GenerateInput =
  | { type: "signup"; email: string; password: string; data: Record<string, unknown> }
  | { type: "magiclink" | "recovery"; email: string }
  | { type: "email_change"; email: string; newEmail: string };

export type GeneratedLink =
  | { ok: true; tokenHash: string; userId: string | null }
  | { ok: false; reason: "unavailable" | "exists" | "not_found" | "failed"; message?: string };

export async function generateAuthToken(input: GenerateInput): Promise<GeneratedLink> {
  const admin = createAdminSupabase();
  if (!admin) return { ok: false, reason: "unavailable" };

  const params =
    input.type === "signup"
      ? { type: "signup" as const, email: input.email, password: input.password, options: { data: input.data } }
      : input.type === "email_change"
        ? { type: "email_change_new" as const, email: input.email, newEmail: input.newEmail }
        : { type: input.type, email: input.email };

  const { data, error } = await admin.auth.admin.generateLink(params);
  if (error || !data?.properties?.hashed_token) {
    const message = error?.message || "";
    if (/already|registered|exists/i.test(message)) return { ok: false, reason: "exists", message };
    if (/not.?found|no user/i.test(message)) return { ok: false, reason: "not_found", message };
    console.warn("[auth] generate_link_failed", { type: input.type, message });
    return { ok: false, reason: "failed", message };
  }
  return { ok: true, tokenHash: data.properties.hashed_token, userId: data.user?.id ?? null };
}

/** Envia pelo Resend; o link não fica salvo no registro de envios (nem pode ser reenviado). */
export async function sendAuthEmail(input: {
  key: "auth_confirm_signup" | "auth_password_reset" | "auth_email_change" | "auth_email_change_notice";
  to: string;
  userId?: string | null;
  customerName: string;
  actionLink?: string;
  newEmail?: string;
}) {
  return queueTemplateEmail({
    key: input.key,
    to: input.to,
    toUserId: input.userId ?? null,
    vars: {
      customerName: input.customerName,
      actionLink: input.actionLink ?? "",
      newEmail: input.newEmail ?? "",
    },
    redact: input.actionLink ? [input.actionLink] : [],
  });
}
