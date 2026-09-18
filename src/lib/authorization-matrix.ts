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
    notes: "404. Membership não concede leitura org-wide. Mesa ops usa /api/ops, não esta rota.",
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
    notes: "Usuários, papéis e tenant global continuam FUTURE. Mesa do pedido é outra linha.",
  },
  {
    resource: "fila operacional / atribuir pedido a OPERATOR",
    CLIENT: "DENY",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "ADMIN e OPERATOR leem/atualizam qualquer pedido via /api/ops. Assignment por operador TBD. Não é lista da Organization do cliente.",
  },
  {
    resource: "caso do próprio pedido (mensagens e arquivos)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Cliente só no próprio userId. Staff via canOperateCases.",
  },
  {
    resource: "caso de pedido alheio",
    CLIENT: "DENY",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "404 para CLIENT. OPERATOR não herda org; herda mesa operacional explícita.",
  },
  {
    resource: "próprio dossiê (GET/POST /api/dossiers)",
    CLIENT: "ALLOW",
    OPERATOR: "ALLOW",
    ADMIN: "ALLOW",
    notes: "Dono = context.userId. Body userId/organizationId ignorados. organizationId é contexto.",
  },
  {
    resource: "dossiê alheio (GET /api/dossiers/[id])",
    CLIENT: "DENY",
    OPERATOR: "DENY",
    ADMIN: "DENY",
    notes: "404. Sem OR por organizationId. ADMIN global FUTURE.",
  },
  {
    resource: "listar dossiês da Organization",
    CLIENT: "DENY",
    OPERATOR: "TBD",
    ADMIN: "FUTURE",
    notes: "Fail-closed. Membership não lista dossiês do tenant.",
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
