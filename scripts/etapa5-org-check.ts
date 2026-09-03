import { isBusinessAccount, isPartnerAccount } from "../src/lib/auth-types";
import { planAfterBusinessOnboarding } from "../src/lib/org-plan";
import { AUTHORIZATION_MATRIX } from "../src/lib/authorization-matrix";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(planAfterBusinessOnboarding(null) === "STANDARD", "new org is STANDARD");
assert(planAfterBusinessOnboarding("STANDARD") === "STANDARD", "standard stays standard");
assert(planAfterBusinessOnboarding("PARTNER") === "PARTNER", "existing partner is not downgraded");

const client = {
  id: "u1",
  authId: "a1",
  email: "a@example.invalid",
  name: "A",
  phone: null,
  cpf: null,
  role: "CLIENT" as const,
  organization: null,
};
assert(!isBusinessAccount(client), "CLIENT without org is not business");
assert(!isPartnerAccount(client), "CLIENT without org is not partner");

const b2bStandard = {
  ...client,
  organization: {
    id: "org-a",
    name: "Empresa A",
    tradeName: null,
    cnpj: "00000000000000",
    plan: "STANDARD" as const,
    cnpjVerifiedAt: new Date().toISOString(),
    cnpjStatus: "ATIVA",
    city: null,
    state: null,
  },
};
assert(isBusinessAccount(b2bStandard), "membership org is business");
assert(!isPartnerAccount(b2bStandard), "STANDARD is not partner");
assert(b2bStandard.role === "CLIENT", "business user stays CLIENT");

const b2bPartner = {
  ...b2bStandard,
  organization: { ...b2bStandard.organization, plan: "PARTNER" as const },
};
assert(isBusinessAccount(b2bPartner), "partner org is still business");
assert(isPartnerAccount(b2bPartner), "PARTNER plan is partner");

const onboarding = AUTHORIZATION_MATRIX.find((row) =>
  row.resource.includes("POST /api/org")
);
assert(onboarding?.CLIENT === "ALLOW", "CLIENT may onboard business");
assert(onboarding?.ADMIN === "DENY" && onboarding?.OPERATOR === "DENY", "internal denied");

console.log("etapa5-org-check: PASS");
