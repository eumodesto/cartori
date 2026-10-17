import type { UserRole } from "@prisma/client";

/**
 * Níveis de acesso da plataforma. O papel (`User.role`) é o nível; para ADMIN, `User.staffPermissions`
 * restringe as áreas da administração. Lista vazia = acesso total (contas ADMIN anteriores a isto).
 * Regras puras: valem no servidor (gates) e na tela (menus, formulários).
 */

export const ACCESS_LEVELS: ReadonlyArray<{ role: UserRole; label: string; description: string }> = [
  {
    role: "CLIENT",
    label: "Cliente",
    description: "Faz pedidos, acompanha status e mensagens no próprio painel.",
  },
  {
    role: "OPERATOR",
    label: "Operador",
    description: "Mesa operacional: vê todos os pedidos, muda status e conversa com clientes. Não administra.",
  },
  {
    role: "ADMIN",
    label: "Administrador",
    description: "Mesa operacional e as áreas de administração liberadas abaixo.",
  },
];

export const ADMIN_PERMISSIONS = [
  {
    key: "users",
    label: "Usuários e níveis de acesso",
    description: "Cadastrar, editar e excluir clientes e operadores.",
  },
  {
    key: "orders_delete",
    label: "Excluir pedidos",
    description: "Exclusão em massa de pedidos que nunca viraram compra.",
  },
  {
    key: "payments",
    label: "Pagamento manual",
    description: "Registrar pagamento, recusa ou estorno feito fora do site.",
  },
  {
    key: "emails",
    label: "E-mails e templates",
    description: "Editar templates e as configurações de envio.",
  },
  {
    key: "settings",
    label: "Configurações e rastreamento",
    description: "Google Tag Manager, Analytics e Ads.",
  },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]["key"];

const PERMISSION_KEYS = ADMIN_PERMISSIONS.map((item) => item.key) as readonly string[];

export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === "string" && PERMISSION_KEYS.includes(value);
}

/** Corpo da requisição → lista válida e sem repetição; null se vier algo que não é permissão. */
export function sanitizeAdminPermissions(value: unknown): AdminPermission[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every(isAdminPermission)) return null;
  return Array.from(new Set(value as AdminPermission[]));
}

/** Acesso total = ADMIN sem restrição. Só ele concede ADMIN ou muda permissões de outros. */
export function hasFullAdminAccess(role: UserRole, permissions: readonly string[]) {
  return role === "ADMIN" && permissions.length === 0;
}

export function hasAdminPermission(
  role: UserRole,
  permissions: readonly string[],
  permission: AdminPermission
) {
  if (role !== "ADMIN") return false;
  return permissions.length === 0 || permissions.includes(permission);
}

/** Recurso do gate (`requirePlatformAdmin`) → permissão. Recurso sem mapa exige acesso total. */
export function permissionForAdminResource(resourceType: string): AdminPermission | null {
  if (resourceType.startsWith("admin.users")) return "users";
  if (resourceType.startsWith("admin.email")) return "emails";
  if (resourceType.startsWith("admin.tracking")) return "settings";
  if (resourceType === "admin.orders.status") return "payments";
  if (resourceType === "ops.orders.delete") return "orders_delete";
  return null;
}

export function canUseAdminResource(role: UserRole, permissions: readonly string[], resourceType: string) {
  const permission = permissionForAdminResource(resourceType);
  return permission
    ? hasAdminPermission(role, permissions, permission)
    : hasFullAdminAccess(role, permissions);
}

export function accessLevelLabel(role: UserRole, permissions: readonly string[]) {
  const base = ACCESS_LEVELS.find((level) => level.role === role)?.label ?? role;
  if (role !== "ADMIN") return base;
  return permissions.length === 0 ? `${base} · acesso total` : `${base} · restrito`;
}
