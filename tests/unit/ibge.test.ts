import { describe, expect, it } from "vitest";
import { fetchCitiesByState, fetchStates } from "@/lib/ibge";
import { BRAZIL_UFS } from "@/lib/ibge-uf";

describe("localidades do IBGE (snapshot estático)", () => {
  it("tem as 27 UFs, as mesmas de ibge-uf", async () => {
    const states = await fetchStates();
    expect(states.map((s) => s.sigla).sort()).toEqual(BRAZIL_UFS);
  });

  it.each(BRAZIL_UFS)("%s tem municípios com id e nome", async (uf) => {
    const stateId = String((await fetchStates()).find((s) => s.sigla === uf)!.id);
    const cities = await fetchCitiesByState(uf);
    expect(cities.length).toBeGreaterThan(0);
    for (const city of cities) {
      expect(String(city.id).slice(0, 2)).toBe(stateId);
      expect(city.nome.trim()).not.toBe("");
    }
  });

  it("aceita UF minúscula e preserva acentos", async () => {
    const cities = await fetchCitiesByState("sp");
    expect(cities).toContainEqual({ id: 3550308, nome: "São Paulo" });
  });

  it("UF desconhecida devolve lista vazia", async () => {
    expect(await fetchCitiesByState("XX")).toEqual([]);
  });

  it("cobre todos os municípios brasileiros", async () => {
    const counts = await Promise.all(BRAZIL_UFS.map((uf) => fetchCitiesByState(uf)));
    expect(counts.reduce((sum, list) => sum + list.length, 0)).toBe(5571);
  });
});
