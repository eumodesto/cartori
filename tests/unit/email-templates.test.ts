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
