import { UserRole } from "@prisma/client";

/**
 * Authorization matrix (Etapa 6C).
 *
 * Platform roles: CLIENT, OPERATOR, ADMIN.
 * Tenant access is OrganizationMember ACTIVE (orgRole OWNER | ADMIN | MEMBER).
 *
 * ALLOW  — implemented now
 * DENY   — implemented deny
 * FUTURE — intended later, not granted now
 * TBD    — product decision missing; fail-closed
 *
 * OrganizationMemberRole.ADMIN is not UserRole.ADMIN.
 */
export type AuthorizationDecision = "ALLOW" | "DENY" | "FUTURE" | "TBD";

export type AuthorizationMatrixRow = {
  resource: string;
  CLIENT: AuthorizationDecision;
  OPERATOR: AuthorizationDecision;
  ADMIN: AuthorizationDecision;
  notes: string;
};

export const AUTHORIZATION_MATRIX: AuthorizationMatrixRow[] = [
  {
    resource: "próprio perfil (GET /api/auth/me)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Sessão + User Prisma por authId. isBusiness = Membership ACTIVE.",
  },
  {
    resource: "criar pedido B2C (POST /api/orders)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Pedido nasce com userId do contexto. Order.organizationId da Membership ACTIVE. Body role/userId/org/sellerOrgId ignorados.",
  },
  {
    resource: "listar próprios pedidos B2C (GET /api/orders)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Somente order.userId === context.userId. Sem OR por organizationId.",
  },
  {
    resource: "pedido B2C alheio (GET /api/orders/[id])",
    CLIENT: "DENY",
    OPERATOR: "DENY",
    ADMIN: "DENY",
    notes: "404. Membership não concede leitura org-wide. ADMIN global FUTURE.",
  },
  {
    resource: "próprio pedido B2C (GET /api/orders/[id], card)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Ownership pessoal. Não substitui por userId OR organizationId.",
  },
  {
    resource: "listar pedidos da Organization",
    CLIENT: "DENY",
    OPERATOR: "TBD",
    ADMIN: "FUTURE",
    notes: "Fail-closed. MEMBER/OWNER não herda todos os pedidos do tenant.",
  },
  {
    resource: "Organization (acesso ao tenant)",
    CLIENT: "ALLOW",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "CLIENT só com Membership ACTIVE na org. ADMIN bypass só se allowGlobalAdmin explícito.",
  },
  {
    resource: "onboarding empresarial (POST /api/org; alias POST /api/org/partner)",
    CLIENT: "ALLOW",
    OPERATOR: "DENY",
    ADMIN: "DENY",
    notes: "CLIENT sem membership, ou OWNER/ADMIN ACTIVE da mesma org. MEMBER DENY. Não promove platformRole. Não concede PARTNER.",
  },
  {
    resource: "administração global Cartori",
    CLIENT: "DENY",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "Nenhuma API admin nesta etapa.",
  },
  {
    resource: "fila operacional / atribuir pedido a OPERATOR",
    CLIENT: "DENY",
    OPERATOR: "TBD",
    ADMIN: "FUTURE",
    notes: "Escopo OPERATOR (global vs assigned-only) não decidido.",
  },
  {
    resource: "equipe / invites / OrganizationMember",
    CLIENT: "FUTURE",
    OPERATOR: "DENY",
    ADMIN: "FUTURE",
    notes: "Não implementar nesta etapa.",
  },
];

export const AUTHORIZATION_ROLES: UserRole[] = ["CLIENT", "OPERATOR", "ADMIN"];
