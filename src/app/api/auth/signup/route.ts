import { NextRequest } from "next/server";
import { IdentityConflictError, syncAuthUser } from "@/lib/auth";
import { COMPANY_DASHBOARD_PATH } from "@/lib/auth-intent";
import { lookupCnpj } from "@/lib/cnpj";
import { completePendingCompany, PENDING_COMPANY_KEY, type PendingCompany } from "@/lib/pending-company";
import { prisma } from "@/lib/prisma";
import {
  formatProfessionalRegistry,
  isProfessionalRegistryKind,
} from "@/lib/professional-registry";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { deleteAuthUser } from "@/lib/supabase/admin";
import { createRouteSupabase } from "@/lib/supabase/route";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { cartoriAuthCallbackUrl } from "@/lib/supabase/site-url";
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

  const { supabase, json } = createRouteSupabase();
  const created = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: cartoriAuthCallbackUrl(
        req,
        pendingCompany ? COMPANY_DASHBOARD_PATH : "/painel"
      ),
      data: {
        name,
        phone,
        app: "cartori",
        account_type: accountType,
        terms_version: TERMS_VERSION,
        terms_accepted_at: new Date().toISOString(),
        ...(pendingCompany ? { [PENDING_COMPANY_KEY]: pendingCompany } : {}),
      },
    },
  });

  if (created.error || !created.data.user) {
    const message = authErrorMessage(created.error?.message, "Não foi possível criar a conta.");
    return json({ success: false, error: message }, { status: 400 });
  }

  const confirmed = Boolean(created.data.user.email_confirmed_at && created.data.session);
  if (!confirmed) {
    return json({
      success: true,
      needsConfirmation: true,
      message: pendingCompany
        ? "Enviamos um link de confirmação para o seu e-mail. Ao abrir o link, a conta e a empresa ficam ativas."
        : "Enviamos um link de confirmação para o seu e-mail. A conta só entra depois que você abrir esse link.",
    });
  }

  try {
    const profile = await syncAuthUser({
      authId: created.data.user.id,
      email: created.data.user.email || email,
      name,
      phone,
      cpf,
    });
    await completePendingCompany(supabase, created.data.user);
    return json({ success: true, profile });
  } catch (error) {
    if (error instanceof IdentityConflictError) {
      await supabase.auth.signOut();
      await deleteAuthUser(created.data.user.id);
      return json({ success: false, error: error.message }, { status: error.status });
    }
    throw error;
  }
}
