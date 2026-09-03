import { OrganizationMemberRole, UserRole } from "@prisma/client";
import { isBusinessAccount } from "../src/lib/auth-types";
import {
  buildAuthContext,
  canAccessOrganization,
  canAccessOwnedOrder,
  canOnboardBusiness,
  hasActiveMembership,
  hasOrgRole,
} from "../src/lib/authorization-policy";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function ctx(input: {
  platformRole: UserRole;
  memberships?: Array<{ organizationId: string; orgRole: OrganizationMemberRole }>;
  userId?: string;
}) {
  return buildAuthContext({
    userId: input.userId ?? "user-a",
    authId: "auth-a",
    platformRole: input.platformRole,
    activeMemberships: input.memberships ?? [],
  });
}

const client = ctx({ platformRole: "CLIENT" });
assert(!hasActiveMembership(client), "CLIENT sem membership");
assert(!canAccessOrganization(client, "org-a"), "CLIENT sem acesso B2B");
assert(canOnboardBusiness(client), "CLIENT pode iniciar onboarding");

const owner = ctx({
  platformRole: "B2B_ADMIN",
  memberships: [{ organizationId: "org-a", orgRole: "OWNER" }],
});
assert(hasActiveMembership(owner), "OWNER ACTIVE reconhecido");
assert(canAccessOrganization(owner, "org-a"), "OWNER acessa própria org");
assert(!canAccessOrganization(owner, "org-b"), "OWNER não acessa Org B");
assert(canOnboardBusiness(owner), "OWNER pode atualizar a própria org");
assert(hasOrgRole(owner, ["OWNER"]), "orgRole OWNER");

const orgAdmin = ctx({
  platformRole: "CLIENT",
  memberships: [{ organizationId: "org-a", orgRole: "ADMIN" }],
});
assert(canAccessOrganization(orgAdmin, "org-a"), "ADMIN ACTIVE acessa própria org");
assert(orgAdmin.platformRole === "CLIENT", "platformRole separado de orgRole");
assert(orgAdmin.orgRole === "ADMIN", "orgRole ADMIN");
assert(canOnboardBusiness(orgAdmin), "ADMIN org pode atualizar");

const member = ctx({
  platformRole: "B2B_MEMBER",
  userId: "um",
  memberships: [{ organizationId: "org-a", orgRole: "MEMBER" }],
});
assert(canAccessOrganization(member, "org-a"), "MEMBER ACTIVE reconhecido");
assert(!canOnboardBusiness(member), "MEMBER sem onboarding");
assert(!hasOrgRole(member, ["OWNER", "ADMIN"]), "MEMBER sem papel de gestão");

const removed = ctx({
  platformRole: "B2B_ADMIN",
  memberships: [],
});
assert(!canAccessOrganization(removed, "org-a"), "REMOVED / sem ACTIVE perde acesso");
assert(!canOnboardBusiness(removed), "B2B_ADMIN legado sem membership não autoriza onboarding");

const fkOnly = ctx({ platformRole: "B2B_ADMIN" });
assert(fkOnly.organizationId === null, "contexto ignora User.organizationId");
assert(!canAccessOrganization(fkOnly, "org-a"), "FK sem membership NÃO autoriza");

const membershipWins = ctx({
  platformRole: "CLIENT",
  memberships: [{ organizationId: "org-a", orgRole: "OWNER" }],
});
assert(canAccessOrganization(membershipWins, "org-a"), "membership vence platformRole CLIENT");
assert(membershipWins.role === "CLIENT", "platformRole legado permanece");

const cartoriAdmin = ctx({ platformRole: "ADMIN" });
assert(!canAccessOrganization(cartoriAdmin, "org-a"), "ADMIN Cartori sem allowGlobalAdmin");
assert(
  canAccessOrganization(cartoriAdmin, "org-a", { allowGlobalAdmin: true }),
  "ADMIN Cartori só com bypass explícito"
);
assert(!canOnboardBusiness(cartoriAdmin), "ADMIN Cartori não faz onboarding tenant");

const operator = ctx({ platformRole: "OPERATOR" });
assert(!canAccessOrganization(operator, "org-a"), "OPERATOR sem bypass");
assert(!canAccessOrganization(operator, "org-a", { allowGlobalAdmin: true }), "OPERATOR não herda bypass");
assert(!canOnboardBusiness(operator), "OPERATOR negado no onboarding");

assert(canAccessOwnedOrder(owner, "user-a"), "pedido próprio por userId");
assert(!canAccessOwnedOrder(owner, "other"), "pedido alheio negado mesmo com membership");
assert(!canAccessOwnedOrder(member, "user-a"), "MEMBER não lê pedido de outro userId");

assert(
  !isBusinessAccount({
    id: "u1",
    authId: "a1",
    email: "a@example.invalid",
    name: null,
    phone: null,
    cpf: null,
    role: "B2B_ADMIN",
    organization: null,
  }),
  "isBusiness falso sem organization no perfil (membership)"
);

console.log("etapa6b-authorization-check: PASS");
