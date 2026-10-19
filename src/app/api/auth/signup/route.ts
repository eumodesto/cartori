import { NextRequest } from "next/server";
import { lookupCnpj } from "@/lib/cnpj";
import { completePendingCompany, PENDING_COMPANY_KEY, type PendingCompany } from "@/lib/pending-company";
import { prisma } from "@/lib/prisma";
import {
  formatProfessionalRegistry,
  isProfessionalRegistryKind,
} from "@/lib/professional-registry";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { recordLogin } from "@/lib/presence";
import { createAdminSupabase, deleteAuthUser } from "@/lib/supabase/admin";
import { createRouteSupabase } from "@/lib/supabase/route";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { TERMS_VERSION } from "@/lib/terms";
import { digitsOnly } from "@/lib/utils";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_MESSAGE,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  normalizeCpf,
} from "@/lib/validators";

const CPF_CONFLICT = "Já existe uma conta associada a este CPF.";

function badRequest(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}

async function validateCompany(body: Record<string, unknown>): Promise<
  { ok: true; company: PendingCompany } | { ok: false; response: Response }
> {
  const cnpj = digitsOnly(String(body.cnpj || ""));
  if (!isValidCnpj(cnpj)) {
    return { ok: false, response: badRequest("Informe um CNPJ válido.") };
  }

  const kind = body.registryType;
  if (!isProfessionalRegistryKind(kind)) {
    return { ok: false, response: badRequest("Escolha o registro profissional: OAB ou CRECI.") };
  }
  const registry = formatProfessionalRegistry(
    kind,
    String(body.registryState || ""),
    String(body.registryNumber || "")
  );
  if (!registry) {
    return { ok: false, response: badRequest(`Informe a UF e o número do ${kind}.`) };
  }

  const taken = await prisma.organization.findUnique({ where: { cnpj }, select: { id: true } });
  if (taken) {
    return {
      ok: false,
      response: badRequest("Este CNPJ já está cadastrado em outra conta InterJuri.", 409),
    };
  }

  let company;
  try {
    company = await lookupCnpj(cnpj);
  } catch {
    return {
      ok: false,
      response: badRequest("Não foi possível consultar o CNPJ agora. Tente de novo em instantes.", 503),
    };
  }
  if (!company) {
    return { ok: false, response: badRequest("Não encontramos esse CNPJ na Receita Federal.", 404) };
  }
  if (!company.active) {
    return {
      ok: false,
      response: badRequest(
        `CNPJ com situação "${company.status}". Só empresas ativas podem ser cadastradas.`
      ),
    };
  }

  return {
    ok: true,
    company: {
      cnpj,
      oabNumber: kind === "OAB" ? registry : null,
      creciNumber: kind === "CRECI" ? registry : null,
    },
  };
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`signup:${clientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { success: false, error: "Muitas tentativas de cadastro. Espere alguns minutos." },
      { status: 429 }
    );
  }

  if (!isSupabaseConfigured()) {
    return Response.json(
      { success: false, error: "Configure as chaves do Supabase para criar a conta." },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const accountType = body.accountType === "company" ? "company" : "person";
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "");
  const cpfRaw = String(body.cpf || "");
  const cpf = cpfRaw ? normalizeCpf(cpfRaw) : "";

  if (name.split(/\s+/).filter(Boolean).length < 2) {
    return badRequest("Informe o nome completo.");
  }
  if (!isValidEmail(email)) {
    return badRequest("Informe um e-mail válido.");
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return badRequest(PASSWORD_MIN_MESSAGE);
  }
  if (password !== confirmPassword) {
    return badRequest("As senhas não conferem.");
  }
  if (body.acceptedTerms !== true) {
    return badRequest("É preciso aceitar os Termos de Uso e a Política de Privacidade.");
  }
  if (!phone) {
    return badRequest(accountType === "company" ? "Informe o telefone da empresa." : "Informe o telefone.");
  }
  if (!isValidPhone(phone)) {
    return badRequest("Telefone inválido.");
  }
  if (cpfRaw && !isValidCpf(cpfRaw)) {
    return badRequest("CPF inválido.");
  }

  let pendingCompany: PendingCompany | null = null;
  if (accountType === "company") {
    const checked = await validateCompany(body);
    if (!checked.ok) return checked.response;
    pendingCompany = checked.company;
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

  // Conta entra na hora (sem e-mail de confirmação): criada já confirmada pelo admin do
  // Supabase, que não envia nada. As boas-vindas saem pelo Resend no cadastro do banco.
  const admin = createAdminSupabase();
  if (!admin) return badRequest("Cadastro indisponível no momento. Tente de novo em instantes.", 503);

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phone,
      ...(cpf ? { cpf } : {}),
      app: "cartori",
      account_type: accountType,
      terms_version: TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      ...(pendingCompany ? { [PENDING_COMPANY_KEY]: pendingCompany } : {}),
    },
  });
  if (created.error || !created.data.user) {
    const message = created.error?.message || "";
    if (/already|registered|exists/i.test(message)) {
      return badRequest("Já existe uma conta com este e-mail. Entre com a sua senha ou use \"Esqueci minha senha\".", 409);
    }
    console.warn("[auth] signup_create_failed", { message });
    // Chave de serviço errada ou ausente (comum no localhost, com o valor de exemplo da Vercel).
    if (/invalid api key|jwt|apikey/i.test(message)) {
      return badRequest("Cadastro indisponível: a chave de serviço da Supabase deste ambiente é inválida.", 503);
    }
    return badRequest(authErrorMessage(message, "Não foi possível criar a conta."));
  }
  const authUser = created.data.user;

  // Abre a sessão neste navegador (cookies na resposta).
  const { supabase, json } = createRouteSupabase();
  const signed = await supabase.auth.signInWithPassword({ email, password });
  if (signed.error || !signed.data.user) {
    await deleteAuthUser(authUser.id);
    console.warn("[auth] signup_signin_failed", { message: signed.error?.message });
    return badRequest("Não foi possível entrar na conta agora. Tente de novo.");
  }

  try {
    const profile = await syncAuthUser({ authId: authUser.id, email, name, phone, cpf });
    await completePendingCompany(supabase, signed.data.user);
    await recordLogin(profile.id);
    return json({ success: true, profile });
  } catch (error) {
    if (error instanceof IdentityConflictError) {
      await supabase.auth.signOut();
      await deleteAuthUser(authUser.id);
      return json({ success: false, error: error.message }, { status: error.status });
    }
    throw error;
  }
}
