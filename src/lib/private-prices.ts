import type { UfFormatPrices } from "./crc-uf-prices";

/**
 * Preços por UF das certidões privadas (Registro Civil), vendidas só na área logada.
 * Importe SOMENTE em código de servidor (via private-catalog.ts): em componente "use client"
 * estes dados iriam para o JS público.
 */
export const PRIVATE_UF_FORMAT_PRICES: Record<string, Record<string, UfFormatPrices>> = {
  "certidao-de-nascimento": {
    "MT": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "RJ": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "BA": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 459.97
    },
    "PA": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "SP": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "AM": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.67
    },
    "MA": {
      "ELECTRONIC": 319.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "GO": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "PI": {
      "ELECTRONIC": 329.9,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "MG": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "RO": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "MS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "ES": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.97
    },
    "PE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "AC": {
      "ELECTRONIC": 249.97,
      "PAPER": 299.97,
      "BOTH": 399.97
    },
    "SE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "CE": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 479.97
    },
    "AL": {
      "ELECTRONIC": 259.97,
      "PAPER": 319.97,
      "BOTH": 419.97
    },
    "PR": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "RN": {
      "ELECTRONIC": 349.97,
      "PAPER": 397.77,
      "BOTH": 529.97
    },
    "DF": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.9
    },
    "PB": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "SC": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "AP": {
      "ELECTRONIC": 292.9,
      "PAPER": 379.97,
      "BOTH": 495.97
    },
    "TO": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "RR": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "RS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    }
  },
  "certidao-de-casamento": {
    "PA": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "SC": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "RN": {
      "ELECTRONIC": 349.97,
      "PAPER": 397.77,
      "BOTH": 529.97
    },
    "RO": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "GO": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "CE": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 479.97
    },
    "SP": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "MT": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "ES": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.97
    },
    "RS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 585.97
    },
    "SE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "RR": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "TO": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "AM": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "RJ": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "AC": {
      "ELECTRONIC": 249.97,
      "PAPER": 299.97,
      "BOTH": 399.97
    },
    "DF": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.9
    },
    "AP": {
      "ELECTRONIC": 292.9,
      "PAPER": 379.97,
      "BOTH": 495.97
    },
    "PE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "PI": {
      "ELECTRONIC": 329.9,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "PR": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "MS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "MA": {
      "ELECTRONIC": 319.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "PB": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "BA": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 459.97
    },
    "MG": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "AL": {
      "ELECTRONIC": 259.97,
      "PAPER": 319.97,
      "BOTH": 419.97
    }
  },
  "certidao-de-obito": {
    "AC": {
      "ELECTRONIC": 249.97,
      "PAPER": 299.97,
      "BOTH": 399.97
    },
    "RO": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "DF": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.9
    },
    "MG": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "PI": {
      "ELECTRONIC": 329.9,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "MS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "PE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "ES": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 429.97
    },
    "TO": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "MT": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "GO": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "AM": {
      "ELECTRONIC": 329.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "SP": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "PA": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "SC": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "RN": {
      "ELECTRONIC": 349.97,
      "PAPER": 397.77,
      "BOTH": 529.97
    },
    "CE": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 479.97
    },
    "RJ": {
      "ELECTRONIC": 419.97,
      "PAPER": 509.77,
      "BOTH": 695.97
    },
    "PR": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "RR": {
      "ELECTRONIC": 269.97,
      "PAPER": 319.77,
      "BOTH": 429.97
    },
    "AP": {
      "ELECTRONIC": 292.9,
      "PAPER": 379.97,
      "BOTH": 495.97
    },
    "SE": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    },
    "MA": {
      "ELECTRONIC": 319.97,
      "PAPER": 397.77,
      "BOTH": 519.97
    },
    "AL": {
      "ELECTRONIC": 259.97,
      "PAPER": 319.97,
      "BOTH": 419.97
    },
    "BA": {
      "ELECTRONIC": 299.97,
      "PAPER": 359.97,
      "BOTH": 459.97
    },
    "RS": {
      "ELECTRONIC": 299.97,
      "PAPER": 379.77,
      "BOTH": 495.97
    },
    "PB": {
      "ELECTRONIC": 317.97,
      "PAPER": 429.77,
      "BOTH": 509.97
    }
  },
  "certidao-de-divorcio": {
    "BA": {
      "ELECTRONIC": 319.9,
      "PAPER": 440.97,
      "BOTH": 549.97
    },
    "RO": {
      "ELECTRONIC": 349.97,
      "PAPER": 389.9,
      "BOTH": 520.11
    },
    "GO": {
      "ELECTRONIC": 439.9,
      "PAPER": 489.9,
      "BOTH": 589.9
    },
    "TO": {
      "ELECTRONIC": 388.97,
      "PAPER": 486.77,
      "BOTH": 578.97
    },
    "PB": {
      "ELECTRONIC": 397.67,
      "PAPER": 509.56,
      "BOTH": 599.97
    },
    "RJ": {
      "ELECTRONIC": 489.97,
      "PAPER": 589.74,
      "BOTH": 795.97
    },
    "ES": {
      "ELECTRONIC": 359.97,
      "PAPER": 439.97,
      "BOTH": 509.97
    },
    "RN": {
      "ELECTRONIC": 409.97,
      "PAPER": 446.77,
      "BOTH": 599.97
    },
    "PR": {
      "ELECTRONIC": 378.27,
      "PAPER": 460.07,
      "BOTH": 584.97
    },
    "AP": {
      "ELECTRONIC": 362.9,
      "PAPER": 447.97,
      "BOTH": 556.97
    },
    "PE": {
      "ELECTRONIC": 386.97,
      "PAPER": 497.9,
      "BOTH": 580.27
    },
    "AM": {
      "ELECTRONIC": 368.97,
      "PAPER": 467.77,
      "BOTH": 589.67
    },
    "DF": {
      "ELECTRONIC": 349.67,
      "PAPER": 439.97,
      "BOTH": 517.27
    },
    "CE": {
      "ELECTRONIC": 319.6,
      "PAPER": 440.97,
      "BOTH": 559.97
    },
    "MT": {
      "ELECTRONIC": 350.97,
      "PAPER": 380,
      "BOTH": 499.69
    },
    "SC": {
      "ELECTRONIC": 378.97,
      "PAPER": 460.07,
      "BOTH": 585.97
    },
    "MG": {
      "ELECTRONIC": 367.67,
      "PAPER": 509.77,
      "BOTH": 579.9
    },
    "RR": {
      "ELECTRONIC": 339.97,
      "PAPER": 399.77,
      "BOTH": 519.97
    },
    "PI": {
      "ELECTRONIC": 400.97,
      "PAPER": 448.9,
      "BOTH": 589.97
    },
    "SP": {
      "ELECTRONIC": 399.9,
      "PAPER": 430.9,
      "BOTH": 566.27
    },
    "MA": {
      "ELECTRONIC": 409.9,
      "PAPER": 462.9,
      "BOTH": 549.9
    },
    "MS": {
      "ELECTRONIC": 359.97,
      "PAPER": 449.77,
      "BOTH": 575.97
    },
    "SE": {
      "ELECTRONIC": 387.97,
      "PAPER": 510.67,
      "BOTH": 599.97
    },
    "AC": {
      "ELECTRONIC": 289.9,
      "PAPER": 349.9,
      "BOTH": 463.9
    },
    "AL": {
      "ELECTRONIC": 299.9,
      "PAPER": 361.67,
      "BOTH": 479.9
    },
    "PA": {
      "ELECTRONIC": 498.67,
      "PAPER": 559.87,
      "BOTH": 785.97
    },
    "RS": {
      "ELECTRONIC": 359.97,
      "PAPER": 456.9,
      "BOTH": 585.97
    }
  },
};

export const PRIVATE_UF_APOSTILLE_PRICES: Record<string, Record<string, number>> = {
  "certidao-de-nascimento": {
    AC: 159.97, AL: 159.97, AM: 179.97, AP: 179.97, BA: 279.97, CE: 179.97,
    DF: 179.97, ES: 199.97, GO: 229.97, MA: 279.97, MG: 295.97, MS: 259.97,
    MT: 279.97, PA: 295.97, PB: 209.97, PE: 229.97, PI: 209.97, PR: 209.97,
    RJ: 295.97, RN: 209.97, RO: 179.97, RS: 229.97, SC: 199.97, SE: 209.97,
    SP: 295.97, TO: 199.97,
  },
  "certidao-de-casamento": {
    AC: 159.97, AL: 159.97, AM: 179.97, AP: 179.97, BA: 279.97, CE: 179.97,
    DF: 179.97, ES: 199.97, GO: 229.97, MA: 279.97, MG: 295.97, MS: 259.97,
    MT: 279.97, PA: 295.97, PB: 209.97, PE: 229.97, PI: 209.97, PR: 209.97,
    RJ: 295.97, RN: 209.97, RO: 179.97, RS: 229.97, SC: 199.97, SE: 209.97,
    SP: 295.97, TO: 199.97,
  },
  "certidao-de-obito": {
    AC: 159.97, AL: 159.97, AM: 179.97, AP: 179.97, BA: 279.97, CE: 179.97,
    DF: 179.97, ES: 199.97, GO: 229.97, MA: 279.97, MG: 295.97, MS: 259.97,
    MT: 279.97, PA: 295.97, PB: 209.97, PE: 229.97, PI: 209.97, PR: 209.97,
    RJ: 295.97, RN: 209.97, RO: 179.97, RS: 229.97, SC: 199.97, SE: 209.97,
    SP: 295.97, TO: 199.97,
  },
  "certidao-de-divorcio": {
    AC: 159.97, AL: 159.97, AM: 179.97, AP: 179.97, BA: 279.97, CE: 179.97,
    DF: 179.97, ES: 199.97, GO: 229.97, MA: 279.97, MG: 297.97, MS: 259.97,
    MT: 279.97, PA: 297.97, PB: 209.9, PE: 229.97, PI: 209.9, PR: 209.9,
    RJ: 297.97, RN: 209.9, RO: 179.97, RS: 229.97, SC: 199.97, SE: 209.9,
    SP: 297.97, TO: 199.97,
  },
};
