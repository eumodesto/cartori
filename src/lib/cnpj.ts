import { digitsOnly } from "@/lib/utils";
import { isValidCnpj } from "@/lib/validators";

export type CnpjCompany = {
  cnpj: string;
  name: string;
  tradeName: string | null;
  status: string;
  active: boolean;
  legalNature: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
};

const lookupHeaders = {
  Accept: "application/json",
  "User-Agent": "Cartori/1.0 (consulta-cnpj)",
};

function companyFromBrasilApi(cnpj: string, data: Record<string, unknown>): CnpjCompany {
  const status = String(data.descricao_situacao_cadastral || "").trim();
  const street = [data.descricao_tipo_logradouro, data.logradouro].filter(Boolean).join(" ").trim();
  const number = String(data.numero || "").trim();
  const district = String(data.bairro || "").trim();
  const address = [street, number, district].filter(Boolean).join(", ");
  const ddd = String(data.ddd_telefone_1 || "").replace(/\D/g, "");

  return {
    cnpj,
    name: String(data.razao_social || "").trim(),
    tradeName: String(data.nome_fantasia || "").trim() || null,
    status: status || "DESCONHECIDA",
    active: status.toUpperCase() === "ATIVA",
    legalNature: String(data.natureza_juridica || "").trim() || null,
    email: String(data.email || "").trim() || null,
    phone: ddd || null,
    address: address || null,
    city: String(data.municipio || "").trim() || null,
    state: String(data.uf || "").trim().toUpperCase() || null,
    cep: String(data.cep || "").replace(/\D/g, "") || null,
  };
}

function companyFromReceitaWs(cnpj: string, data: Record<string, unknown>): CnpjCompany {
  const status = String(data.situacao || "").trim();
  const street = String(data.logradouro || "").trim();
  const number = String(data.numero || "").trim();
  const district = String(data.bairro || "").trim();
  const address = [street, number, district].filter(Boolean).join(", ");

  return {
    cnpj,
    name: String(data.nome || "").trim(),
    tradeName: String(data.fantasia || "").trim() || null,
    status: status || "DESCONHECIDA",
    active: status.toUpperCase() === "ATIVA",
    legalNature: String(data.natureza_juridica || "").trim() || null,
    email: String(data.email || "").trim() || null,
    phone: String(data.telefone || "").replace(/\D/g, "") || null,
    address: address || null,
    city: String(data.municipio || "").trim() || null,
    state: String(data.uf || "").trim().toUpperCase() || null,
    cep: String(data.cep || "").replace(/\D/g, "") || null,
  };
}

export async function lookupCnpj(raw: string): Promise<CnpjCompany | null> {
  const cnpj = digitsOnly(raw);
  if (!isValidCnpj(cnpj)) return null;

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: lookupHeaders,
      cache: "no-store",
    });
    if (response.status === 404) return null;
    if (response.ok) {
      return companyFromBrasilApi(cnpj, (await response.json()) as Record<string, unknown>);
    }
  } catch {
    // Fallback abaixo.
  }

  const fallback = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
    headers: lookupHeaders,
    cache: "no-store",
  });
  if (fallback.status === 404) return null;
  if (!fallback.ok) {
    throw new Error("Não foi possível consultar o CNPJ agora. Tente de novo em instantes.");
  }

  const data = (await fallback.json()) as Record<string, unknown>;
  if (String(data.status || "").toUpperCase() === "ERROR") return null;
  return companyFromReceitaWs(cnpj, data);
}
