import { describe, expect, it } from "vitest";
import {
  formatAddress,
  formatEmail,
  formatPhone,
  mapAttributions,
  normalizeCity,
  toCartorioRow,
} from "../../scripts/import-serventias-cnj.mjs";

describe("importação de serventias do Justiça Aberta", () => {
  it("mapeia naturezas do CNJ para os códigos do projeto", () => {
    expect(mapAttributions("Notas | Registro Civil das Pessoas Naturais").codes).toEqual([
      "NOTAS",
      "REGISTRO_CIVIL",
    ]);
    // Pessoas Jurídicas não é Registro Civil de pessoas naturais.
    expect(
      mapAttributions("Registro de Títulos e Documentos | Registro Civil das Pessoas Jurídicas").codes
    ).toEqual(["EMPRESAS"]);
    expect(mapAttributions("Registro de Distribuição")).toEqual({
      codes: ["OUTROS"],
      unknown: ["Registro de Distribuição"],
    });
  });

  it("usa o nome do município do IBGE", () => {
    expect(normalizeCity("SP", "SAO PAULO")).toEqual({ city: "São Paulo", matched: true });
    expect(normalizeCity("AC", "brasileia")).toEqual({ city: "Brasiléia", matched: true });
    expect(normalizeCity("DF", "Taguatinga")).toEqual({ city: "Brasília", matched: true });
    expect(normalizeCity("RN", "Açu")).toEqual({ city: "Assú", matched: true });
    expect(normalizeCity("SP", "Lugar Inexistente")).toEqual({ city: "Lugar Inexistente", matched: false });
  });

  it("formata contato sem completar dado que falta", () => {
    expect(formatPhone("1126930871")).toBe("(11) 2693-0871");
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("123")).toBeNull();
    expect(formatPhone(null)).toBeNull();
    expect(formatEmail(" Cartorio@Exemplo.com.br ; outro@x.com")).toBe("cartorio@exemplo.com.br");
    expect(formatEmail("não tem")).toBeNull();
    expect(formatAddress({ endereco: "Rua A", numero: "10", bairro: "Centro", cep: "4112001" })).toBe(
      "Rua A, 10 – Centro – CEP 04112-001"
    );
    expect(formatAddress({ endereco: null, bairro: "Centro", cep: "01001000" })).toBeNull();
  });

  it("limpa caracteres de controle do nome", () => {
    const row = toCartorioRow({
      cns: "115071",
      denominacao_fantasia: "OFICIAL - 06º SUBDISTRITO \u0013 BRÁS",
      natureza: "Registro Civil das Pessoas Naturais",
      cidade: "São Paulo",
      uf: "SP",
      telefone: null,
      email: null,
      endereco: null,
    });
    expect(row.name).toBe("OFICIAL - 06º SUBDISTRITO – BRÁS");
    expect(row.phone).toBeNull();
    expect(row.attributions).toEqual(["REGISTRO_CIVIL"]);
  });
});
