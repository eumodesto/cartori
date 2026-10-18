import { NextRequest, NextResponse } from "next/server";
import { hasFullAdminAccess } from "@/lib/admin-permissions";
import { normalizeAccess, userChangeError } from "@/lib/admin-user-rules";
import { countFullAdmins, deleteManagedUser, updateManagedUser } from "@/lib/admin-users";
import { requirePlatformAdmin } from "@/lib/authorization";
import { BULK_ORDER_LIMIT, DELETE_CONFIRM_WORD, parseBulkOrderIds } from "@/lib/order-bulk";
import { prisma } from "@/lib/prisma";

/** Em massa só se troca entre Cliente e Operador; administrador é definido um a um. */
const BULK_ROLES = ["CLIENT", "OPERATOR"] as const;

function badRequest(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Ações em massa na lista de usuários: "role" (Cliente ↔ Operador) e "delete".
 * Cada conta passa pelas mesmas travas da edição individual (userChangeError);
 * a que não pode mudar é pulada e volta na resposta com o motivo.
 */
export async function POST(req: NextRequest) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ids = parseBulkOrderIds(body.userIds);
  if (!ids) return badRequest(`Selecione de 1 a ${BULK_ORDER_LIMIT} usuários.`);

  const action = String(body.action || "");
  const role = String(body.role || "");
  if (action === "role" && !(BULK_ROLES as readonly string[]).includes(role)) {
    return badRequest("Em massa, escolha Cliente ou Operador.");
  }
  if (action === "delete" && String(body.confirm || "").trim().toUpperCase() !== DELETE_CONFIRM_WORD) {
    return badRequest(`Digite ${DELETE_CONFIRM_WORD} para confirmar.`);
  }
  if (action !== "role" && action !== "delete") return badRequest("Ação inválida.");

  const actor = {
    userId: gate.context.userId,
    role: gate.context.platformRole,
    permissions: gate.context.adminPermissions,
  };
  const targets = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true, role: true, staffPermissions: true },
  });
  const byId = new Map(targets.map((user) => [user.id, user]));

  let fullAdminCount = await countFullAdmins();
  const done: string[] = [];
  const skipped: Array<{ id: string; email: string | null; reason: string }> = [];

  for (const id of ids) {
    const target = byId.get(id);
    if (!target) {
      skipped.push({ id, email: null, reason: "não encontrado" });
      continue;
    }
    const current = { id: target.id, role: target.role, permissions: target.staffPermissions };
    const next = action === "role" ? normalizeAccess(role as (typeof BULK_ROLES)[number], []) : null;
    const refusal = userChangeError({ actor, target: current, next, fullAdminCount });
    if (refusal) {
      skipped.push({ id, email: target.email, reason: refusal });
      continue;
    }

    if (next) {
      if (target.role === next.role) {
        done.push(id);
        continue;
      }
      const updated = await updateManagedUser({ id, role: next.role, staffPermissions: [] });
      if (!updated) {
        skipped.push({ id, email: target.email, reason: "não encontrado" });
        continue;
      }
    } else {
      const result = await deleteManagedUser(id);
      if (result !== "ok") {
        skipped.push({
          id,
          email: target.email,
          reason: result === "missing" ? "não encontrado" : "falha ao remover o login no Supabase",
        });
        continue;
      }
    }
    if (hasFullAdminAccess(target.role, target.staffPermissions)) fullAdminCount -= 1;
    done.push(id);
  }

  console.warn("[admin] users_bulk", { actorUserId: actor.userId, action, role: role || null, done });
  return NextResponse.json({ success: true, done, skipped });
}
