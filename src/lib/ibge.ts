import { IBGEState, IBGECity } from "./types";
import localidades from "./ibge-localidades.json";

/**
 * Snapshot estático da API de localidades do IBGE. A API ao vivo não envia a
 * cadeia completa do certificado e o Node recusa a conexão
 * (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Atualizar o JSON se surgir município novo.
 */
const MUNICIPIOS = localidades.municipios as unknown as Record<string, [number, string][]>;

export async function fetchStates(): Promise<IBGEState[]> {
  return localidades.estados;
}

export async function fetchCitiesByState(uf: string): Promise<IBGECity[]> {
  return (MUNICIPIOS[uf.toUpperCase()] ?? []).map(([id, nome]) => ({ id, nome }));
}
