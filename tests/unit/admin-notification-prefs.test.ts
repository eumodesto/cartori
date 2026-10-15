import { describe, expect, it } from "vitest";
import { getEmailTemplateDef } from "@/lib/email-templates";
import {
  ADMIN_NOTIFICATION_CATEGORIES,
  notificationCategoryForTemplate,
  resolveNotificationPrefs,
} from "@/lib/notification-prefs";

describe("avisos para administradores", () => {
  it("cada aviso tem template próprio e categoria opcional", () => {
    for (const category of ADMIN_NOTIFICATION_CATEGORIES) {
      expect(getEmailTemplateDef(category.template)?.group).toBe("admin");
      expect(notificationCategoryForTemplate(category.template)).toBe(category.id);
    }
  });

  it("vem ligado por padrão e respeita o desligamento", () => {
    const prefs = resolveNotificationPrefs({ admin_order_pending: false, admin_order_paid: "x" });
    expect(prefs.admin_order_pending).toBe(false);
    expect(prefs.admin_order_paid).toBe(true);
    expect(prefs.admin_customer_message).toBe(true);
    expect(prefs.admin_payment_rejected).toBe(true);
  });
});
