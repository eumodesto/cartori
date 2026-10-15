/**
 * Tags de medição (Google Tag Manager, Google Analytics 4, Google Ads).
 * Só IDs validados por formato chegam ao HTML — nunca código livre, porque o
 * valor é interpolado em <script> no layout raiz.
 */

export type TrackingField = "gtmId" | "ga4Id" | "adsId";

export type TrackingConfig = {
  enabled: boolean;
  gtmId: string;
  ga4Id: string;
  adsId: string;
};

export const EMPTY_TRACKING_CONFIG: TrackingConfig = {
  enabled: false,
  gtmId: "",
  ga4Id: "",
  adsId: "",
};

export const TRACKING_FIELDS: Record<
  TrackingField,
  { label: string; pattern: RegExp; example: string }
> = {
  gtmId: { label: "Google Tag Manager", pattern: /^GTM-[A-Z0-9]{4,12}$/, example: "GTM-ABC1234" },
  ga4Id: { label: "Google Analytics 4", pattern: /^G-[A-Z0-9]{4,15}$/, example: "G-ABC123DEF4" },
  adsId: { label: "Google Ads", pattern: /^AW-\d{6,15}$/, example: "AW-123456789" },
};

const FIELD_KEYS = Object.keys(TRACKING_FIELDS) as TrackingField[];

export function normalizeTrackingId(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isValidTrackingId(field: TrackingField, value: string): boolean {
  return TRACKING_FIELDS[field].pattern.test(value);
}

/** Valida o corpo vindo do painel. Campo vazio desativa aquela tag. */
export function parseTrackingInput(
  body: unknown
): { ok: true; config: TrackingConfig } | { ok: false; field: TrackingField; error: string } {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const config: TrackingConfig = { ...EMPTY_TRACKING_CONFIG, enabled: input.enabled === true };

  for (const field of FIELD_KEYS) {
    const value = normalizeTrackingId(input[field]);
    if (value && !isValidTrackingId(field, value)) {
      const { label, example } = TRACKING_FIELDS[field];
      return { ok: false, field, error: `ID do ${label} inválido. Formato esperado: ${example}.` };
    }
    config[field] = value;
  }
  return { ok: true, config };
}

/** Lê o valor persistido revalidando cada ID; qualquer coisa fora do formato é descartada. */
export function parseStoredTracking(raw: string | null | undefined): TrackingConfig {
  if (!raw) return { ...EMPTY_TRACKING_CONFIG };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...EMPTY_TRACKING_CONFIG };
  }
  const input = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const config: TrackingConfig = { ...EMPTY_TRACKING_CONFIG, enabled: input.enabled === true };
  for (const field of FIELD_KEYS) {
    const value = normalizeTrackingId(input[field]);
    config[field] = isValidTrackingId(field, value) ? value : "";
  }
  return config;
}

/** Domínios mínimos que o CSP do site precisa liberar para cada tag funcionar. */
export const TRACKING_CSP_REQUIREMENTS: Record<TrackingField, Record<string, string[]>> = {
  gtmId: {
    "script-src": ["https://*.googletagmanager.com"],
    "connect-src": ["https://*.googletagmanager.com"],
  },
  ga4Id: {
    "script-src": ["https://*.googletagmanager.com"],
    "connect-src": ["https://*.google-analytics.com", "https://*.analytics.google.com"],
  },
  adsId: {
    "script-src": ["https://*.googletagmanager.com", "https://www.googleadservices.com"],
    "connect-src": ["https://www.googleadservices.com", "https://*.g.doubleclick.net"],
  },
};

function parseCsp(header: string): Map<string, Set<string>> {
  const directives = new Map<string, Set<string>>();
  for (const part of header.split(";")) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name) directives.set(name.toLowerCase(), new Set(sources));
  }
  return directives;
}

export type PublishedTagCheck = {
  inHtml: boolean;
  cspMissing: string[];
};

/** Confere, no HTML e no CSP servidos pelo site, se cada ID salvo está publicado. */
export function checkPublishedTags(
  html: string,
  cspHeader: string,
  config: TrackingConfig
): Partial<Record<TrackingField, PublishedTagCheck>> {
  const csp = parseCsp(cspHeader);
  const result: Partial<Record<TrackingField, PublishedTagCheck>> = {};
  for (const field of FIELD_KEYS) {
    const id = config[field];
    if (!id) continue;
    const cspMissing = Object.entries(TRACKING_CSP_REQUIREMENTS[field]).flatMap(
      ([directive, sources]) =>
        sources
          .filter((source) => !csp.get(directive)?.has(source))
          .map((source) => `${directive} ${source}`)
    );
    result[field] = { inHtml: html.includes(id), cspMissing };
  }
  return result;
}

/** Tags que de fato vão para a página. Desligado → nenhuma. */
export function activeTrackingTags(config: TrackingConfig): {
  gtmId: string | null;
  gtagIds: string[];
} {
  if (!config.enabled) return { gtmId: null, gtagIds: [] };
  return {
    gtmId: config.gtmId || null,
    gtagIds: [config.ga4Id, config.adsId].filter(Boolean),
  };
}
