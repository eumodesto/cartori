import { prisma } from "@/lib/prisma";
import {
  type EmailTemplateDef,
  getEmailTemplateDef,
  listEmailTemplateDefs,
} from "@/lib/email-templates";

const RESEND_KEY = "email.resendApiKey";
const FROM_KEY = "email.fromEmail";

/**
 * Lê uma configuração do banco (AppSetting). Tolerante: se a tabela ainda não
 * existir (migration não aplicada) ou o banco falhar, retorna null.
 */
async function readSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function writeSetting(key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/**
 * Credenciais de envio (server-only). Banco tem precedência sobre env.
 * NUNCA exponha o resultado disto ao browser.
 */
export async function resolveEmailCredentials(): Promise<{
  apiKey: string;
  from: string;
}> {
  const dbKey = await readSetting(RESEND_KEY);
  const dbFrom = await readSetting(FROM_KEY);
  return {
    apiKey: (dbKey || process.env.RESEND_API_KEY || "").trim(),
    from: (dbFrom || process.env.EMAIL_FROM || "").trim(),
  };
}

function maskSecret(value: string): string {
  const v = value.trim();
  if (!v) return "";
  const last4 = v.slice(-4);
  return `••••••••${last4}`;
}

/** Visão segura das configurações para a UI. Nunca inclui o token em claro. */
export async function getEmailSettingsView(): Promise<{
  fromEmail: string;
  fromSource: "db" | "env" | "none";
  resendConfigured: boolean;
  resendMasked: string;
  resendSource: "db" | "env" | "none";
}> {
  const dbKey = await readSetting(RESEND_KEY);
  const dbFrom = await readSetting(FROM_KEY);
  const envKey = (process.env.RESEND_API_KEY || "").trim();
  const envFrom = (process.env.EMAIL_FROM || "").trim();

  const resendValue = (dbKey || envKey || "").trim();
  const fromValue = (dbFrom || envFrom || "").trim();

  return {
    fromEmail: fromValue,
    fromSource: dbFrom ? "db" : envFrom ? "env" : "none",
    resendConfigured: Boolean(resendValue),
    resendMasked: maskSecret(resendValue),
    resendSource: dbKey ? "db" : envKey ? "env" : "none",
  };
}

export async function saveEmailSettings(input: {
  resendApiKey?: string | null;
  fromEmail?: string | null;
}): Promise<void> {
  if (typeof input.resendApiKey === "string" && input.resendApiKey.trim()) {
    await writeSetting(RESEND_KEY, input.resendApiKey.trim());
  }
  if (typeof input.fromEmail === "string") {
    await writeSetting(FROM_KEY, input.fromEmail.trim());
  }
}

export type ResolvedEmailTemplate = {
  key: string;
  subject: string;
  body: string;
  active: boolean;
  source: "override" | "default";
  def: EmailTemplateDef;
};

/** Resolve um template: override ativo do banco, senão o default do código. */
export async function resolveEmailTemplate(
  key: string
): Promise<ResolvedEmailTemplate | null> {
  const def = getEmailTemplateDef(key);
  if (!def) return null;

  try {
    const override = await prisma.emailTemplate.findUnique({ where: { key } });
    if (override && override.active) {
      return {
        key,
        subject: override.subject,
        body: override.body,
        active: override.active,
        source: "override",
        def,
      };
    }
  } catch {
    // tabela ausente/erro → usa default
  }

  return {
    key,
    subject: def.subject,
    body: def.body,
    active: true,
    source: "default",
    def,
  };
}

/** Lista todos os templates com o conteúdo efetivo (override ou default). */
export async function listResolvedTemplates(): Promise<ResolvedEmailTemplate[]> {
  const defs = listEmailTemplateDefs();
  let overrides = new Map<string, { subject: string; body: string; active: boolean }>();
  try {
    const rows = await prisma.emailTemplate.findMany();
    overrides = new Map(
      rows.map((r) => [r.key, { subject: r.subject, body: r.body, active: r.active }])
    );
  } catch {
    overrides = new Map();
  }

  return defs.map((def) => {
    const ov = overrides.get(def.key);
    if (ov && ov.active) {
      return {
        key: def.key,
        subject: ov.subject,
        body: ov.body,
        active: ov.active,
        source: "override" as const,
        def,
      };
    }
    return {
      key: def.key,
      subject: def.subject,
      body: def.body,
      active: true,
      source: "default" as const,
      def,
    };
  });
}

export async function saveTemplateOverride(
  key: string,
  input: { subject: string; body: string; active?: boolean }
): Promise<void> {
  await prisma.emailTemplate.upsert({
    where: { key },
    create: {
      key,
      subject: input.subject,
      body: input.body,
      active: input.active ?? true,
    },
    update: {
      subject: input.subject,
      body: input.body,
      active: input.active ?? true,
    },
  });
}

/** Remove o override → volta ao default do código. */
export async function resetTemplateOverride(key: string): Promise<void> {
  try {
    await prisma.emailTemplate.delete({ where: { key } });
  } catch {
    // sem override / tabela ausente: nada a fazer
  }
}
