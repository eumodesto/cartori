import { describe, expect, it } from "vitest";
import {
  activeTrackingTags,
  checkPublishedTags,
  parseStoredTracking,
  parseTrackingInput,
} from "@/lib/tracking";

describe("parseTrackingInput", () => {
  it("normaliza e aceita IDs válidos", () => {
    const result = parseTrackingInput({
      enabled: true,
      gtmId: " gtm-abc1234 ",
      ga4Id: "g-abc123def4",
      adsId: "AW-123456789",
    });
    expect(result).toEqual({
      ok: true,
      config: { enabled: true, gtmId: "GTM-ABC1234", ga4Id: "G-ABC123DEF4", adsId: "AW-123456789" },
    });
  });

  it("campo vazio desativa só aquela tag", () => {
    const result = parseTrackingInput({ enabled: true, gtmId: "", ga4Id: "G-ABC123DEF4" });
    expect(result.ok && result.config).toEqual({
      enabled: true,
      gtmId: "",
      ga4Id: "G-ABC123DEF4",
      adsId: "",
    });
  });

  it.each([
    ["gtmId", "GTM-'+alert(1)+'"],
    ["ga4Id", "UA-12345-1"],
    ["adsId", "AW-12AB"],
    ["gtmId", "<script>"],
  ])("rejeita %s fora do formato (%s)", (field, value) => {
    const result = parseTrackingInput({ enabled: true, [field]: value });
    expect(result).toMatchObject({ ok: false, field });
  });

  it("enabled só é verdadeiro com booleano true", () => {
    const result = parseTrackingInput({ enabled: "true", gtmId: "GTM-ABC1234" });
    expect(result.ok && result.config.enabled).toBe(false);
  });

  it("ignora campos fora do contrato", () => {
    const result = parseTrackingInput({ enabled: true, extra: "x", role: "ADMIN" });
    expect(result.ok && Object.keys(result.config).sort()).toEqual([
      "adsId",
      "enabled",
      "ga4Id",
      "gtmId",
    ]);
  });
});

describe("parseStoredTracking", () => {
  it("valor ausente ou JSON inválido vira configuração vazia e desligada", () => {
    expect(parseStoredTracking(null).enabled).toBe(false);
    expect(parseStoredTracking("{quebrado").gtmId).toBe("");
  });

  it("descarta ID adulterado no banco antes de chegar ao HTML", () => {
    const config = parseStoredTracking(
      JSON.stringify({ enabled: true, gtmId: "GTM-X');alert(1);//", ga4Id: "G-ABC123DEF4" })
    );
    expect(config).toEqual({ enabled: true, gtmId: "", ga4Id: "G-ABC123DEF4", adsId: "" });
  });
});

describe("checkPublishedTags", () => {
  const config = { enabled: true, gtmId: "GTM-ABC1234", ga4Id: "G-ABC123DEF4", adsId: "AW-123456789" };
  const fullCsp = [
    "default-src 'self'",
    "script-src 'self' https://*.googletagmanager.com https://www.googleadservices.com",
    "connect-src 'self' https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://www.googleadservices.com https://*.g.doubleclick.net",
  ].join("; ");

  it("marca cada ID presente no HTML e CSP completo", () => {
    const html = `<script>gtm('GTM-ABC1234')</script><script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>AW-123456789`;
    expect(checkPublishedTags(html, fullCsp, config)).toEqual({
      gtmId: { inHtml: true, cspMissing: [] },
      ga4Id: { inHtml: true, cspMissing: [] },
      adsId: { inHtml: true, cspMissing: [] },
    });
  });

  it("aponta ID ausente e domínio faltando no CSP", () => {
    const csp = "script-src 'self' https://*.googletagmanager.com; connect-src 'self'";
    const result = checkPublishedTags("<html>GTM-ABC1234</html>", csp, {
      ...config,
      adsId: "",
    });
    expect(result.gtmId).toEqual({
      inHtml: true,
      cspMissing: ["connect-src https://*.googletagmanager.com"],
    });
    expect(result.ga4Id?.inHtml).toBe(false);
    expect(result.ga4Id?.cspMissing).toContain("connect-src https://*.google-analytics.com");
    expect(result.adsId).toBeUndefined();
  });

  it("CSP real do next.config cobre as três tags", async () => {
    const nextConfig = (await import("../../next.config.mjs")).default;
    const [{ headers }] = await nextConfig.headers!();
    const csp = headers.find((h: { key: string }) => h.key === "Content-Security-Policy")!.value;
    const result = checkPublishedTags("GTM-ABC1234 G-ABC123DEF4 AW-123456789", csp, config);
    expect(Object.values(result).every((check) => check.cspMissing.length === 0)).toBe(true);
  });
});

describe("activeTrackingTags", () => {
  const full = { enabled: true, gtmId: "GTM-ABC1234", ga4Id: "G-ABC123DEF4", adsId: "AW-123456789" };

  it("pausado não carrega nada", () => {
    expect(activeTrackingTags({ ...full, enabled: false })).toEqual({ gtmId: null, gtagIds: [] });
  });

  it("GA4 e Ads compartilham o mesmo gtag", () => {
    expect(activeTrackingTags(full)).toEqual({
      gtmId: "GTM-ABC1234",
      gtagIds: ["G-ABC123DEF4", "AW-123456789"],
    });
  });

  it("só Ads", () => {
    expect(activeTrackingTags({ ...full, gtmId: "", ga4Id: "" })).toEqual({
      gtmId: null,
      gtagIds: ["AW-123456789"],
    });
  });
});
