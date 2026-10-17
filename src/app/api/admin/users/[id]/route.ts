import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { sanitizeAdminPermissions } from "@/lib/admin-permissions";
import { normalizeAccess, userChangeError } from "@/lib/admin-user-rules";
import {
  countFullAdmins,
  deleteManagedUser,
  getManagedUser,
  isManageableRole,
  updateManagedUser,
} from "@/lib/admin-users";
import { requirePlatformAdmin } from "@/lib/authorization";
import { digitsOnly } from "@/lib/utils";
import { isValidPhone } from "@/lib/validators";

function badRequest(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function notFound() {
  return NextResponse.json({ success: false, error: "Usuário não encontrado." }, { status: 404 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const user = await getManagedUser(params.id);
  if (!user) return notFound();
  return NextResponse.json({ success: true, user });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const target = await getManagedUser(params.id);
  if (!target) return notFound();

  const body = await req.json().catch(() => ({}));
  const patch: { name?: string; phone?: string; role?: UserRole; staffPermissions?: string[] } = {};

  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) return badRequest("Informe o nome completo.");
    patch.name = name;
  }

  if (body.phone !== undefined) {
    const phone = String(body.phone || "");
    if (phone && !isValidPhone(phone)) return badRequest("Telefone inválido.");
    patch.phone = phone ? digitsOnly(phone) : "";
  }

  if (body.role !== undefined || body.staffPermissions !== undefined) {
    const role = body.role === undefined ? target.role : body.role;
    if (!isManageableRole(role)) return badRequest("Nível de acesso inválido.");
    const permissions = sanitizeAdminPermissions(body.staffPermissions ?? target.staffPermissions);
    if (!permissions) return badRequest("Permissão inválida.");
    const next = normalizeAccess(role, permissions);
    const refusal = userChangeError({
      actor: {
        userId: gate.context.userId,
        role: gate.context.platformRole,
        permissions: gate.context.adminPermissions,
      },
      target: { id: target.id, role: target.role, permissions: target.staffPermissions },
      next,
      fullAdminCount: await countFullAdmins(),
    });
    if (refusal) return badRequest(refusal, 403);
    patch.role = next.role;
    patch.staffPermissions = [...next.permissions];
  } else if (target.role === "ADMIN" && target.id !== gate.context.userId) {
    // Nome e telefone de um administrador também ficam com quem tem acesso total.
    const refusal = userChangeError({
      actor: { userId: gate.context.userId, role: gate.context.platformRole, permissions: gate.context.adminPermissions },
      target: { id: target.id, role: target.role, permissions: target.staffPermissions },
      next: { role: target.role, permissions: target.staffPermissions },
      fullAdminCount: await countFullAdmins(),
    });
    if (refusal) return badRequest(refusal, 403);
  }

  if (Object.keys(patch).length === 0) return badRequest("Nada para atualizar.");

  const updated = await updateManagedUser({ id: params.id, ...patch });
  if (!updated) return notFound();
  if (patch.role !== undefined) {
    console.warn("[admin] user_access_changed", {
      actorUserId: gate.context.userId,
      userId: updated.id,
      from: { role: target.role, staffPermissions: target.staffPermissions },
      to: { role: updated.role, staffPermissions: updated.staffPermissions },
    });
  }
  return NextResponse.json({ success: true, user: updated });
}

/** Exclusão definitiva da conta. Confirmação: o e-mail da conta digitado no corpo. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const target = await getManagedUser(params.id);
  if (!target) return notFound();

  const body = await req.json().catch(() => ({}));
  if (String((body as { confirm?: unknown }).confirm || "").trim().toLowerCase() !== target.email) {
    return badRequest("Digite o e-mail da conta para confirmar a exclusão.");
  }

  const refusal = userChangeError({
    actor: { userId: gate.context.userId, role: gate.context.platformRole, permissions: gate.context.adminPermissions },
    target: { id: target.id, role: target.role, permissions: target.staffPermissions },
    next: null,
    fullAdminCount: await countFullAdmins(),
  });
  if (refusal) return badRequest(refusal, 403);

  const result = await deleteManagedUser(target.id);
  if (result === "missing") return notFound();
  if (result === "auth_failed") {
    return badRequest("Não foi possível remover o login no Supabase. Nada foi apagado; tente de novo.", 502);
  }

  console.warn("[admin] user_deleted", {
    actorUserId: gate.context.userId,
    userId: target.id,
    role: target.role,
    ordersKept: target.ordersCount,
  });
  return NextResponse.json({ success: true });
}
