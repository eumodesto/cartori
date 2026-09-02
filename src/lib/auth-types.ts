import { OrganizationPlan, UserRole } from "@prisma/client";

export type AuthOrganization = {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  plan: OrganizationPlan;
  cnpjVerifiedAt: string | null;
  cnpjStatus: string | null;
  city: string | null;
  state: string | null;
};

export type AuthProfile = {
  id: string;
  authId: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  organization: AuthOrganization | null;
};

export function isPartnerAccount(profile: AuthProfile | null | undefined) {
  return Boolean(
    profile?.organization?.plan === "PARTNER" && profile.organization.cnpjVerifiedAt
  );
}

export const PARTNER_LOCKED_HREFS = [
  "/dashboard/dossies",
  "/dashboard/cartorios",
  "/dashboard/organizacao",
  "/dashboard/equipe",
  "/dashboard/financeiro",
];

export function isPartnerLockedHref(href: string) {
  return PARTNER_LOCKED_HREFS.some((path) => href === path || href.startsWith(`${path}/`));
}
