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

/** Empresa cadastrada (B2B). Não implica Partner comercial. */
export function isBusinessAccount(profile: AuthProfile | null | undefined) {
  return Boolean(profile?.organization?.id);
}

/**
 * Condição comercial Partner.
 * Independente de B2B_ADMIN. Activation policy: TBD.
 */
export function isPartnerAccount(profile: AuthProfile | null | undefined) {
  return Boolean(
    profile?.organization?.plan === "PARTNER" && profile.organization.cnpjVerifiedAt
  );
}

export const B2B_LOCKED_HREFS = [
  "/dashboard/dossies",
  "/dashboard/cartorios",
  "/dashboard/organizacao",
  "/dashboard/equipe",
  "/dashboard/financeiro",
];

/** @deprecated use B2B_LOCKED_HREFS — recursos empresariais, não Partner. */
export const PARTNER_LOCKED_HREFS = B2B_LOCKED_HREFS;

export function isBusinessLockedHref(href: string) {
  return B2B_LOCKED_HREFS.some((path) => href === path || href.startsWith(`${path}/`));
}

/** @deprecated use isBusinessLockedHref */
export function isPartnerLockedHref(href: string) {
  return isBusinessLockedHref(href);
}
