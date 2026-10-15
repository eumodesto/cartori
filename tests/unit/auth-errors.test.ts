import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/supabase/auth-errors";

describe("authErrorMessage", () => {
  it("traduz o intervalo de segurança do Supabase", () => {
    expect(
      authErrorMessage("For security purposes, you can only request this after 48 seconds.", "x")
    ).toBe("Por segurança, aguarde 48 segundos antes de tentar de novo.");
  });

  it("traduz conta existente e senha curta", () => {
    expect(authErrorMessage("User already registered", "x")).toMatch(/Já existe uma conta/);
    expect(authErrorMessage("Password should be at least 6 characters.", "x")).toBe(
      "A senha precisa ter pelo menos 6 caracteres."
    );
  });

  it("mensagem desconhecida não sai em inglês", () => {
    expect(authErrorMessage("Something odd happened", "Não foi possível continuar.")).toBe(
      "Não foi possível continuar."
    );
    expect(authErrorMessage("", "Padrão")).toBe("Padrão");
  });
});
