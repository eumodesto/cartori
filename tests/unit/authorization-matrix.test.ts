import type { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { AUTHORIZATION_MATRIX } from "@/lib/authorization-matrix";

const roles: UserRole[] = ["CLIENT", "OPERATOR", "ADMIN"];

function row(fragment: string) {
  const found = AUTHORIZATION_MATRIX.find((item) => item.resource.includes(fragment));
  if (!found) throw new Error(`linha da matriz ausente: ${fragment}`);
  return found;
}

describe("matriz de autorização documentada", () => {
  it("toda decisão é ALLOW, DENY, FUTURE ou TBD", () => {
    for (const item of AUTHORIZATION_MATRIX) {
      for (const role of roles) {
        expect(["ALLOW", "DENY", "FUTURE", "TBD"], `${item.resource} ${role}`).toContain(item[role]);
      }
    }
  });

  it("onboarding empresarial: CLIENT sim, equipe Cartori não", () => {
    const onboarding = row("POST /api/org/partner");
    expect(onboarding.CLIENT).toBe("ALLOW");
    expect(onboarding.OPERATOR).toBe("DENY");
    expect(onboarding.ADMIN).toBe("DENY");
  });

  it("dossiê próprio segue a regra de posse dos pedidos", () => {
    const own = row("próprio dossiê");
    expect([own.CLIENT, own.OPERATOR, own.ADMIN]).toEqual(["ALLOW", "ALLOW", "ALLOW"]);
  });

  it("dossiê alheio não tem bypass por papel", () => {
    const foreign = row("dossiê alheio");
    expect([foreign.CLIENT, foreign.OPERATOR, foreign.ADMIN]).toEqual(["DENY", "DENY", "DENY"]);
  });

  it("listagem de dossiês da Organization é fail-closed para CLIENT", () => {
    expect(row("listar dossiês da Organization").CLIENT).toBe("DENY");
  });

  it("fila operacional é da equipe Cartori", () => {
    const ops = row("fila operacional");
    expect(ops.CLIENT).toBe("DENY");
    expect(ops.OPERATOR).toBe("ALLOW");
    expect(ops.ADMIN).toBe("ALLOW");
  });

  it("caso de pedido alheio: cliente negado, equipe permitida", () => {
    const foreignCase = row("caso de pedido alheio");
    expect(foreignCase.CLIENT).toBe("DENY");
    expect(foreignCase.OPERATOR).toBe("ALLOW");
    expect(foreignCase.ADMIN).toBe("ALLOW");
  });
});
