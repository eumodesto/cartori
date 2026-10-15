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
