import { IBGEState, IBGECity } from "./types";

const IBGE_API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

// Cache em memória para evitar requisições repetidas ao IBGE
let statesCache: IBGEState[] | null = null;
const citiesCache: Record<string, IBGECity[]> = {};

export async function fetchStates(): Promise<IBGEState[]> {
  if (statesCache && statesCache.length > 0) {
    return statesCache;
  }

  try {
    const res = await fetch(`${IBGE_API_BASE}/estados?orderBy=nome`, {
      next: { revalidate: 86400 }, // Cache de 24h no Next.js
    });

    if (!res.ok) throw new Error("Erro ao buscar estados do IBGE");

    const data = await res.json();
    statesCache = data.map((item: any) => ({
      id: item.id,
      sigla: item.sigla,
      nome: item.nome,
    }));

    return statesCache || [];
  } catch (error) {
    console.error("Erro IBGE States:", error);
    // Fallback básico caso o IBGE esteja indisponível
    return [
      { id: 35, sigla: "SP", nome: "São Paulo" },
      { id: 33, sigla: "RJ", nome: "Rio de Janeiro" },
      { id: 31, sigla: "MG", nome: "Minas Gerais" },
      { id: 41, sigla: "PR", nome: "Paraná" },
      { id: 43, sigla: "RS", nome: "Rio Grande do Sul" },
      { id: 42, sigla: "SC", nome: "Santa Catarina" },
      { id: 29, sigla: "BA", nome: "Bahia" },
      { id: 53, sigla: "DF", nome: "Distrito Federal" },
      { id: 52, sigla: "GO", nome: "Goiás" },
    ];
  }
}

export async function fetchCitiesByState(uf: string): Promise<IBGECity[]> {
  const upperUf = uf.toUpperCase();
  if (citiesCache[upperUf] && citiesCache[upperUf].length > 0) {
    return citiesCache[upperUf];
  }

  try {
    const res = await fetch(`${IBGE_API_BASE}/estados/${upperUf}/municipios?orderBy=nome`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`Erro ao buscar municípios para ${upperUf}`);

    const data = await res.json();
    const cities: IBGECity[] = data.map((item: any) => ({
      id: item.id,
      nome: item.nome,
    }));

    citiesCache[upperUf] = cities;
    return cities;
  } catch (error) {
    console.error(`Erro IBGE Cities for ${upperUf}:`, error);
    return [];
  }
}
