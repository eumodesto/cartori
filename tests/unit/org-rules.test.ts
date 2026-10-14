import { describe, expect, it } from "vitest";
import { wouldViolateSingleOrg } from "@/lib/org-membership";
import { planAfterBusinessOnboarding } from "@/lib/org-plan";

describe("wouldViolateSingleOrg", () => {
  it("usuário sem empresa pode criar", () => {
    expect(wouldViolateSingleOrg([], null)).toBe(false);
  });

  it("atualizar a própria empresa é permitido", () => {
    expect(wouldViolateSingleOrg(["org-a"], "org-a")).toBe(false);
  });

  it("segunda empresa é negada", () => {
    expect(wouldViolateSingleOrg(["org-a"], null)).toBe(true);
    expect(wouldViolateSingleOrg(["org-a"], "org-b")).toBe(true);
  });

  it("com duas memberships ativas nega até a própria", () => {
    expect(wouldViolateSingleOrg(["org-a", "org-b"], "org-a")).toBe(true);
  });
});

describe("planAfterBusinessOnboarding", () => {
  it("onboarding nunca concede PARTNER", () => {
    expect(planAfterBusinessOnboarding(null)).toBe("STANDARD");
    expect(planAfterBusinessOnboarding(undefined)).toBe("STANDARD");
    expect(planAfterBusinessOnboarding("STANDARD")).toBe("STANDARD");
  });

  it("não rebaixa quem já é PARTNER", () => {
    expect(planAfterBusinessOnboarding("PARTNER")).toBe("PARTNER");
  });
});
