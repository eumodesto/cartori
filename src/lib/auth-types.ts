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
  avatarUrl: string | null;
  notificationPrefs: Record<string, boolean>;
  organization: AuthOrganization | null;
};

/** Empresa cadastrada (B2B). Não implica Partner comercial. */
export function isBusinessAccount(profile: AuthProfile | null | undefined) {
  return Boolean(profile?.organization?.id);
}

/** Espelho de UI de `canOperateCases`: equipe InterJuri (mesa operacional). */
export function isStaffProfile(profile: AuthProfile | null | undefined) {
  return profile?.role === "ADMIN" || profile?.role === "OPERATOR";
}

/** Espelho de UI de `canManageUsers`: administração da plataforma. */
export function isPlatformAdminProfile(profile: AuthProfile | null | undefined) {
  return profile?.role === "ADMIN";
}

/**
 * Espelho de UI de `canOnboardBusiness`: só CLIENT sem empresa cadastra CNPJ.
 * Equipe InterJuri (OPERATOR/ADMIN) recebe 403 em POST /api/org.
 */
export function canRegisterCompany(profile: AuthProfile | null | undefined) {
  return profile?.role === "CLIENT" && !profile.organization;
}

/**
 * Condição comercial Partner.
 * Independente de papel de plataforma. Activation policy: TBD.
 */
export function isPartnerAccount(profile: AuthProfile | null | undefined) {
  return Boolean(
    profile?.organization?.plan === "PARTNER" && profile.organization.cnpjVerifiedAt
  );
}

export const B2B_LOCKED_HREFS = [
  "/painel/empresa",
  "/painel/equipe",
  "/painel/financeiro",
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
