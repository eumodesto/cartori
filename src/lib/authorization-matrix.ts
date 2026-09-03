import { UserRole } from "@prisma/client";

/**
 * Current authorization matrix (Etapa 4).
 *
 * ALLOW  — implemented now
 * DENY   — implemented deny
 * FUTURE — intended later, not granted now
 * TBD    — product decision missing; fail-closed
 *
 * Do not treat B2B_ADMIN as a weaker ADMIN. They are different domains.
 *
 * Tenant membership today is User.organizationId (single org). OrganizationMember
 * (invites, multi-org, per-org role) is FUTURE and not in this etapa.
 */
export type AuthorizationDecision = "ALLOW" | "DENY" | "FUTURE" | "TBD";

export type AuthorizationMatrixRow = {
  resource: string;
  CLIENT: AuthorizationDecision;
  B2B_ADMIN: AuthorizationDecision;
  B2B_MEMBER: AuthorizationDecision;
  OPERATOR: AuthorizationDecision;
  ADMIN: AuthorizationDecision;
  notes: string;
};

export const AUTHORIZATION_MATRIX: AuthorizationMatrixRow[] = [
  {
    resource: "próprio perfil (GET /api/auth/me)",
    CLIENT: "ALLOW",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Sessão + User Prisma por authId. Sem sessão: profile null, HTTP 200.",
  },
  {
    resource: "criar pedido B2C (POST /api/orders)",
    CLIENT: "ALLOW",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Pedido nasce com userId do contexto. organizationId só do banco. Body role/userId/org/sellerOrgId ignorados.",
  },
  {
    resource: "listar próprios pedidos B2C (GET /api/orders)",
    CLIENT: "ALLOW",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Somente order.userId === context.userId. Sem OR por organizationId.",
  },
  {
    resource: "pedido B2C alheio (GET /api/orders/[id])",
    CLIENT: "DENY",
    B2B_ADMIN: "DENY",
    B2B_MEMBER: "DENY",
    OPERATOR: "DENY",
    ADMIN: "DENY",
    notes: "404. ADMIN global FUTURE. OPERATOR assigned-vs-global TBD.",
  },
  {
    resource: "próprio pedido B2C (GET /api/orders/[id], card)",
    CLIENT: "ALLOW",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Ownership pessoal. Não substitui por userId OR organizationId.",
  },
  {
    resource: "listar pedidos da Organization",
    CLIENT: "DENY",
    B2B_ADMIN: "TBD",
    B2B_MEMBER: "TBD",
    OPERATOR: "TBD",
    ADMIN: "FUTURE",
    notes: "Fail-closed. B2B_MEMBER não herda todos os pedidos do tenant.",
  },
  {
    resource: "Organization (acesso ao tenant)",
    CLIENT: "DENY",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "TBD",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "requireOrganizationAccess: match de organizationId. ADMIN bypass só se allowGlobalAdmin explícito.",
  },
  {
    resource: "onboarding parceiro (POST /api/org/partner)",
    CLIENT: "ALLOW",
    B2B_ADMIN: "ALLOW",
    B2B_MEMBER: "DENY",
    OPERATOR: "DENY",
    ADMIN: "DENY",
    notes: "Fluxo UI existente. Promove CLIENT → B2B_ADMIN. DECISÃO NECESSÁRIA se permanece o onboarding oficial.",
  },
  {
    resource: "administração global Cartori",
    CLIENT: "DENY",
    B2B_ADMIN: "DENY",
    B2B_MEMBER: "DENY",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "Nenhuma API admin nesta etapa.",
  },
  {
    resource: "fila operacional / atribuir pedido a OPERATOR",
    CLIENT: "DENY",
    B2B_ADMIN: "DENY",
    B2B_MEMBER: "DENY",
    OPERATOR: "TBD",
    ADMIN: "FUTURE",
    notes: "Escopo OPERATOR (global vs assigned-only) não decidido.",
  },
  {
    resource: "equipe / invites / OrganizationMember",
    CLIENT: "FUTURE",
    B2B_ADMIN: "FUTURE",
    B2B_MEMBER: "FUTURE",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "Não implementar nesta etapa.",
  },
];

export const AUTHORIZATION_ROLES: UserRole[] = [
  "CLIENT",
  "B2B_ADMIN",
  "B2B_MEMBER",
  "OPERATOR",
  "ADMIN",
];
