import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { sanitizeAdminPermissions } from "@/lib/admin-permissions";
import { normalizeAccess, userChangeError } from "@/lib/admin-user-rules";
import {
  countFullAdmins,
  createManagedUser,
  isManageableRole,
  listManagedUsers,
} from "@/lib/admin-users";
import { requirePlatformAdmin } from "@/lib/authorization";
import { digitsOnly } from "@/lib/utils";
import { isValidEmail, isValidPhone } from "@/lib/validators";

function badRequest(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function GET(req: NextRequest) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get("role");
  const q = searchParams.get("q") || undefined;
  const role: UserRole | undefined = isManageableRole(roleParam) ? roleParam : undefined;

  const users = await listManagedUsers({ role, q });
  return NextResponse.json({ success: true, users });
}

/** Cadastro pela administração: cliente, operador ou administrador (este, só com acesso total). */
export async function POST(req: NextRequest) {
  const gate = await requirePlatformAdmin("admin.users");
  if (!gate.ok) return gate.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "");
  if (!name) return badRequest("Informe o nome completo.");
  if (!isValidEmail(email)) return badRequest("Informe um e-mail válido.");
  if (phone && !isValidPhone(phone)) return badRequest("Telefone inválido.");
  if (!isManageableRole(body.role)) return badRequest("Nível de acesso inválido.");
  const permissions = sanitizeAdminPermissions(body.staffPermissions ?? []);
  if (!permissions) return badRequest("Permissão inválida.");

  const next = normalizeAccess(body.role, permissions);
  const refusal = userChangeError({
    actor: { userId: gate.context.userId, role: gate.context.platformRole, permissions: gate.context.adminPermissions },
    target: null,
    next,
    fullAdminCount: await countFullAdmins(),
  });
  if (refusal) return badRequest(refusal, 403);

  const result = await createManagedUser({
    name,
    email,
    phone: phone ? digitsOnly(phone) : null,
    role: next.role,
    staffPermissions: [...next.permissions],
  });
  if (!result.ok) {
    if (result.reason === "email_taken") return badRequest("Já existe uma conta com esse e-mail.", 409);
    if (result.reason === "auth_unavailable") {
      return badRequest("Cadastro indisponível: falta a chave de serviço do Supabase no servidor.", 503);
    }
    return badRequest("Não foi possível criar a conta agora. Tente de novo.", 502);
  }

  console.warn("[admin] user_created", {
    actorUserId: gate.context.userId,
    userId: result.user.id,
    role: result.user.role,
    staffPermissions: result.user.staffPermissions,
  });
  return NextResponse.json({ success: true, user: result.user }, { status: 201 });
}
