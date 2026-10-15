import { CertificateFormat } from "./types";

export type CrcFormatKey = "ELECTRONIC" | "PAPER" | "BOTH";
export type UfFormatPrices = Record<CrcFormatKey, number | null>;

export const CRC_UF_FORMAT_PRICES: Record<string, Record<string, UfFormatPrices>> = {
  "certidao-de-matricula-de-imovel": {
    "MS": {
      "ELECTRONIC": 209.9,
      "PAPER": 239.9,
      "BOTH": 299.9
    },
    "AC": {
      "ELECTRONIC": 229.9,
      "PAPER": 229.9,
      "BOTH": 259.9
    },
    "SP": {
      "ELECTRONIC": 269.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "PI": {
      "ELECTRONIC": 339.9,
      "PAPER": 359.9,
      "BOTH": 399.9
    },
    "PR": {
      "ELECTRONIC": 289.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "ES": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "BA": {
      "ELECTRONIC": 289.9,
      "PAPER": 309.9,
      "BOTH": 349.9
    },
    "SE": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "AL": {
      "ELECTRONIC": 220.9,
      "PAPER": 240.9,
      "BOTH": 280.9
    },
    "RS": {
      "ELECTRONIC": 219.9,
      "PAPER": 259.9,
      "BOTH": 299.9
    },
    "PB": {
      "ELECTRONIC": 339.9,
      "PAPER": 359.9,
      "BOTH": 399.9
    },
    "MA": {
      "ELECTRONIC": 299.9,
      "PAPER": 319.9,
      "BOTH": 389.9
    },
    "TO": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "CE": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 329.9
    },
    "RJ": {
      "ELECTRONIC": 319.9,
      "PAPER": 339.9,
      "BOTH": 379.9
    },
    "DF": {
      "ELECTRONIC": 229.9,
      "PAPER": 229.9,
      "BOTH": 269.9
    },
    "SC": {
      "ELECTRONIC": 249.9,
      "PAPER": 249.9,
      "BOTH": 299.9
    },
    "GO": {
      "ELECTRONIC": 299.9,
      "PAPER": 319.9,
      "BOTH": 359.9
    },
    "RR": {
      "ELECTRONIC": 209.9,
      "PAPER": 249.9,
      "BOTH": 279.9
    },
    "AM": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "AP": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "MG": {
      "ELECTRONIC": 269.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "PA": {
      "ELECTRONIC": 289.9,
      "PAPER": 289.9,
      "BOTH": 349.9
    },
    "PE": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "RO": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "RN": {
      "ELECTRONIC": 319.9,
      "PAPER": 339.9,
      "BOTH": 379.9
    },
    "MT": {
      "ELECTRONIC": 220.9,
      "PAPER": 240.9,
      "BOTH": 299.9
    }
  },
  "certidao-negativa-de-onus-de-imovel": {
    "AC": {
      "ELECTRONIC": 229.9,
      "PAPER": 249.9,
      "BOTH": 269.9
    },
    "AL": {
      "ELECTRONIC": 219.9,
      "PAPER": 239.9,
      "BOTH": 269.9
    },
    "AM": {
      "ELECTRONIC": 219.9,
      "PAPER": 239.9,
      "BOTH": 269.9
    },
    "AP": {
      "ELECTRONIC": 229.9,
      "PAPER": 249.9,
      "BOTH": 279.9
    },
    "BA": {
      "ELECTRONIC": 332.99,
      "PAPER": 352.99,
      "BOTH": 382.99
    },
    "CE": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 319.9
    },
    "DF": {
      "ELECTRONIC": 229.9,
      "PAPER": 249.9,
      "BOTH": 279.9
    },
    "ES": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 309.9
    },
    "GO": {
      "ELECTRONIC": 299.9,
      "PAPER": 319.9,
      "BOTH": 339.9
    },
    "MA": {
      "ELECTRONIC": 259.9,
      "PAPER": 379.9,
      "BOTH": 399.9
    },
    "MG": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 339.9
    },
    "MS": {
      "ELECTRONIC": 219.9,
      "PAPER": 249.9,
      "BOTH": 279.9
    },
    "MT": {
      "ELECTRONIC": 299.9,
      "PAPER": 319.9,
      "BOTH": 349.9
    },
    "PA": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 349.9
    },
    "PB": {
      "ELECTRONIC": 259.9,
      "PAPER": 279.9,
      "BOTH": 319.9
    },
    "PE": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 309.9
    },
    "PI": {
      "ELECTRONIC": 359.9,
      "PAPER": 379.9,
      "BOTH": 409.9
    },
    "PR": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 329.9
    },
    "RJ": {
      "ELECTRONIC": 314.9,
      "PAPER": 334.9,
      "BOTH": 364.9
    },
    "RN": {
      "ELECTRONIC": 249.9,
      "PAPER": 269.9,
      "BOTH": 289.9
    },
    "RO": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 319.9
    },
    "RR": {
      "ELECTRONIC": 229.9,
      "PAPER": 259.9,
      "BOTH": 289.9
    },
    "RS": {
      "ELECTRONIC": 229.9,
      "PAPER": 249.9,
      "BOTH": 289.9
    },
    "SC": {
      "ELECTRONIC": 269.9,
      "PAPER": 289.9,
      "BOTH": 319.9
    },
    "SE": {
      "ELECTRONIC": 240.9,
      "PAPER": 260.9,
      "BOTH": 290.9
    },
    "SP": {
      "ELECTRONIC": 259.9,
      "PAPER": 260.9,
      "BOTH": 290.9
    },
    "TO": {
      "ELECTRONIC": 239.9,
      "PAPER": 249.9,
      "BOTH": 279.9
    }
  }
};

export const CRC_UF_APOSTILLE_PRICES: Record<string, Record<string, number>> = {
};

export const CRC_UF_FLAT_PRICES: Record<string, Record<string, number>> = {
  "certidao-de-protesto": {
  "SP": 249.97,
  "PE": 249.97,
  "AL": 249.97,
  "RO": 256.97,
  "SC": 257.37,
  "PR": 257.99,
  "RN": 267.77,
  "MS": 267.97,
  "PB": 276.97,
  "BA": 279.9,
  "RJ": 279.97,
  "PI": 285.97,
  "DF": 285.97,
  "CE": 289.9,
  "TO": 289.97,
  "MG": 293.49,
  "ES": 299.97,
  "AC": 299.97,
  "SE": 305.97,
  "MA": 309.95,
  "RR": 309.97,
  "MT": 314.97,
  "AM": 329.9,
  "AP": 339.9,
  "GO": 372.99,
  "RS": 377.97,
  "PA": 389.75
},
};

export function crcFormatKey(format: CertificateFormat): CrcFormatKey {
  if (format === "PHYSICAL_PAPER") return "PAPER";
  if (format === "BOTH") return "BOTH";
  return "ELECTRONIC";
}

export function lookupUfFormatPrice(slug: string, uf: string, format: CertificateFormat): number | null {
  const row = CRC_UF_FORMAT_PRICES[slug]?.[uf.toUpperCase()];
  if (!row) return null;
  const key = crcFormatKey(format);
  return row[key] ?? row.ELECTRONIC ?? row.PAPER ?? row.BOTH ?? null;
}

export function lookupUfApostillePrice(slug: string, uf?: string): number | null {
  const n = CRC_UF_APOSTILLE_PRICES[slug]?.[(uf || "").toUpperCase()];
  return n == null ? null : n;
}

export function lookupUfFlatPrice(slug: string, uf: string): number | null {
  const n = CRC_UF_FLAT_PRICES[slug]?.[uf.toUpperCase()];
  return n == null ? null : n;
}
