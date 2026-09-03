const ATTRIBUTION_LABEL: Record<string, string> = {
  REGISTRO_CIVIL: "Registro Civil de Pessoas Naturais",
  NOTAS: "Tabelionato de Notas",
  IMOVEIS: "Registro de Imóveis",
  PROTESTO: "Protesto de Títulos",
  EMPRESAS: "Registro de Títulos e Documentos e Pessoas Jurídicas",
  OUTROS: "Serventia",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function codesFromAttribution(attribution: string): string[] {
  const text = normalize(attribution);
  const codes: string[] = [];
  if (text.includes("civil")) codes.push("REGISTRO_CIVIL");
  if (text.includes("imove")) codes.push("IMOVEIS");
  if (text.includes("nota")) codes.push("NOTAS");
  if (text.includes("protesto")) codes.push("PROTESTO");
  if (text.includes("empresa") || text.includes("juridic") || text.includes("titulos e documentos")) {
    codes.push("EMPRESAS");
  }
  return codes.length ? [...new Set(codes)] : ["OUTROS"];
}

export function attributionFromCodes(codes: string[]): string {
  const labels = codes
    .map((code) => ATTRIBUTION_LABEL[code] || "")
    .filter(Boolean);
  return labels.join(" e ") || ATTRIBUTION_LABEL.OUTROS;
}

export function matchesServentiaCategory(
  attribution: string,
  codes: string[],
  category: string
): boolean {
  if (!category || category === "geral") return true;
  if (category === "registro-civil") {
    return codes.includes("REGISTRO_CIVIL") || attribution.includes("Registro Civil");
  }
  if (category === "imoveis") {
    return codes.includes("IMOVEIS") || attribution.includes("Registro de Imóveis");
  }
  if (category === "notas") {
    return codes.includes("NOTAS") || attribution.includes("Tabelionato de Notas");
  }
  if (category === "protesto") {
    return codes.includes("PROTESTO") || attribution.includes("Protesto");
  }
  if (category === "pessoa-juridica") {
    return codes.includes("EMPRESAS");
  }
  return true;
}
