import { describe, expect, it } from "vitest";
import {
  EMAIL_TEMPLATE_DEFS,
  ORDER_STATUS_TEMPLATE_STATUSES,
  getEmailTemplateDef,
  orderStatusTemplateKey,
  renderTemplateString,
} from "@/lib/email-templates";

describe("templates de e-mail", () => {
  it("chaves são únicas", () => {
    const keys = EMAIL_TEMPLATE_DEFS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(["account_created", "order_created", "docs_request_testamento"])(
    "template essencial %s existe",
    (key) => {
      expect(getEmailTemplateDef(key)).toBeTruthy();
    }
  );

  it.each([...ORDER_STATUS_TEMPLATE_STATUSES])("status %s tem template", (status) => {
    expect(getEmailTemplateDef(orderStatusTemplateKey(status))).toBeTruthy();
  });

  it("interpolação substitui conhecidas e zera desconhecidas", () => {
    expect(renderTemplateString("Olá {{nome}} — {{ desconhecida }}", { nome: "Ana" })).toBe(
      "Olá Ana — "
    );
  });

  it.each(EMAIL_TEMPLATE_DEFS.map((def) => [def.key, def] as const))(
    "%s só usa variáveis declaradas",
    (_key, def) => {
      const declared = new Set(def.variables.map((v) => v.name));
      const used = [...`${def.subject}\n${def.body}`.matchAll(/\{\{\s*([^}\s]+)\s*\}\}/g)].map(
        (m) => m[1]
      );
      expect(used.filter((name) => !declared.has(name))).toEqual([]);
    }
  );
});

describe("e-mails de pagamento ao cliente", () => {
  it("templates existem e seguem a preferência de atualizações do pedido", async () => {
    const { getEmailTemplateDef } = await import("@/lib/email-templates");
    const { notificationCategoryForTemplate } = await import("@/lib/notification-prefs");
    for (const key of ["payment_rejected", "payment_refunded", "order_status_PAID"]) {
      expect(getEmailTemplateDef(key), key).toBeDefined();
      expect(notificationCategoryForTemplate(key)).toBe("order_updates");
    }
  });
});

describe("e-mails de acesso (saem pelo Resend)", () => {
  it("templates existem, sempre enviam e usam o link de acesso", async () => {
    const { getEmailTemplateDef } = await import("@/lib/email-templates");
    const { notificationCategoryForTemplate } = await import("@/lib/notification-prefs");
    for (const key of ["auth_confirm_signup", "auth_password_reset", "auth_email_change"]) {
      const def = getEmailTemplateDef(key);
      expect(def?.body, key).toContain("{{actionLink}}");
      expect(notificationCategoryForTemplate(key)).toBeNull();
    }
    expect(getEmailTemplateDef("auth_email_change_notice")?.body).not.toContain("{{actionLink}}");
  });

  it("só aceita os tipos de link conhecidos", async () => {
    const { isAuthLinkType } = await import("@/lib/auth-email-links");
    expect(isAuthLinkType("recovery")).toBe(true);
    expect(isAuthLinkType("invite")).toBe(false);
  });
});

describe("remetente e chave do Resend", () => {
  it("barra webmail e aceita Nome <e-mail> do domínio", async () => {
    const { senderProblem, isResendApiKey } = await import("@/lib/email-sender");
    expect(senderProblem("Fulano <fulano@gmail.com>")).toMatch(/gmail\.com/);
    expect(senderProblem("InterJuri <nao-responda@interjuri.com.br>")).toBeNull();
    expect(isResendApiKey("re_AbCdEf1234567890xyz")).toBe(true);
    expect(isResendApiKey("minhaSenha123")).toBe(false);
  });
});
