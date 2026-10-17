import type { UserRole } from "@prisma/client";
import { hasFullAdminAccess } from "@/lib/admin-permissions";

/** Regras de quem pode cadastrar, alterar e excluir quem. Puras: testáveis sem banco. */

export type AccessShape = { role: UserRole; permissions: readonly string[] };
export type UserChangeActor = AccessShape & { userId: string };
export type UserChangeTarget = AccessShape & { id: string };

function samePermissions(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

/**
 * Mensagem de recusa, ou null se a mudança pode seguir.
 * - target null = cadastro novo; next null = exclusão.
 * - fullAdminCount = quantos ADMIN com acesso total existem hoje.
 */
export function userChangeError(input: {
  actor: UserChangeActor;
  target: UserChangeTarget | null;
  next: AccessShape | null;
  fullAdminCount: number;
}): string | null {
  const { actor, target, next, fullAdminCount } = input;
  const actorFull = hasFullAdminAccess(actor.role, actor.permissions);

  if (target && target.id === actor.userId) {
    if (!next) return "Você não pode excluir a própria conta por aqui.";
    if (next.role !== target.role || !samePermissions(next.permissions, target.permissions)) {
      return "Você não pode alterar o próprio nível de acesso. Peça a outro administrador.";
    }
  }

  // Administrador restrito cuida de clientes e operadores; quem mexe em administradores tem acesso total.
  const touchesAdmin = target?.role === "ADMIN" || next?.role === "ADMIN";
  if (touchesAdmin && !actorFull) {
    return "Só um administrador com acesso total cadastra, altera ou exclui administradores.";
  }

  const targetFull = target ? hasFullAdminAccess(target.role, target.permissions) : false;
  const staysFull = next ? hasFullAdminAccess(next.role, next.permissions) : false;
  if (targetFull && !staysFull && fullAdminCount <= 1) {
    return "Este é o único administrador com acesso total. Dê acesso total a outra pessoa antes.";
  }

  return null;
}

/** Permissões só valem para ADMIN; outros níveis gravam lista vazia. */
export function normalizeAccess(role: UserRole, permissions: readonly string[]): AccessShape {
  return { role, permissions: role === "ADMIN" ? [...permissions] : [] };
}
