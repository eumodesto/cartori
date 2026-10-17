import { Prisma, UserRole } from "@prisma/client";
import { queueTemplateEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { createAdminSupabase, deleteAuthUser } from "@/lib/supabase/admin";
import { digitsOnly } from "@/lib/utils";

export const MANAGEABLE_ROLES: readonly UserRole[] = ["CLIENT", "OPERATOR", "ADMIN"] as const;

export function isManageableRole(value: unknown): value is UserRole {
  return typeof value === "string" && (MANAGEABLE_ROLES as readonly string[]).includes(value);
}

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  staffPermissions: string[];
  phone: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string; plan: string } | null;
  ordersCount: number;
  dossiersCount: number;
};

type UserRow = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    staffPermissions: true;
    phone: true;
    cpf: true;
    createdAt: true;
    updatedAt: true;
    organizationMemberships: {
      select: { organization: { select: { id: true; name: true; plan: true } } };
    };
    _count: { select: { orders: true; dossiers: true } };
  };
}>;

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  staffPermissions: true,
  phone: true,
  cpf: true,
  createdAt: true,
  updatedAt: true,
  organizationMemberships: {
    where: { status: "ACTIVE" as const },
    select: { organization: { select: { id: true, name: true, plan: true } } },
    orderBy: { createdAt: "asc" as const },
    take: 1,
  },
  _count: { select: { orders: true, dossiers: true } },
} satisfies Prisma.UserSelect;

function toManagedUser(row: UserRow): ManagedUser {
  const org = row.organizationMemberships[0]?.organization ?? null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    staffPermissions: row.staffPermissions,
    phone: row.phone,
    cpf: row.cpf,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    organization: org ? { id: org.id, name: org.name, plan: org.plan } : null,
    ordersCount: row._count.orders,
    dossiersCount: row._count.dossiers,
  };
}

export async function listManagedUsers(
  opts: { role?: UserRole; q?: string; limit?: number } = {}
): Promise<ManagedUser[]> {
  const where: Prisma.UserWhereInput = {};
  if (opts.role) where.role = opts.role;

  const q = opts.q?.trim();
  if (q) {
    const or: Prisma.UserWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    const digits = digitsOnly(q);
    if (digits) or.push({ cpf: { contains: digits } });
    where.OR = or;
  }

  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(opts.limit ?? 200, 1), 500),
    select: userSelect,
  });
  return rows.map(toManagedUser);
}

export async function getManagedUser(id: string): Promise<ManagedUser | null> {
  const row = await prisma.user.findUnique({ where: { id }, select: userSelect });
  return row ? toManagedUser(row) : null;
}

export async function updateManagedUser(input: {
  id: string;
  name?: string | null;
  phone?: string | null;
  role?: UserRole;
  staffPermissions?: string[];
}): Promise<ManagedUser | null> {
  const data: Prisma.UserUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.role !== undefined) data.role = input.role;
  if (input.staffPermissions !== undefined) data.staffPermissions = input.staffPermissions;

  try {
    await prisma.user.update({ where: { id: input.id }, data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    throw error;
  }
  return getManagedUser(input.id);
}

/** ADMIN com acesso total (staffPermissions vazio): guarda contra ficar sem ninguém. */
export async function countFullAdmins() {
  return prisma.user.count({ where: { role: "ADMIN", staffPermissions: { isEmpty: true } } });
}

export type CreateUserResult =
  | { ok: true; user: ManagedUser }
  | { ok: false; reason: "email_taken" | "auth_unavailable" | "auth_failed" };

/**
 * Cadastro pela administração. A conta nasce no Supabase Auth (e-mail já confirmado, sem senha) e
 * no banco com o mesmo authId; a pessoa define a senha em "Esqueci minha senha", no próprio navegador.
 */
export async function createManagedUser(input: {
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  staffPermissions: string[];
}): Promise<CreateUserResult> {
  const email = input.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, reason: "email_taken" };
  }
  const admin = createAdminSupabase();
  if (!admin) return { ok: false, reason: "auth_unavailable" };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: input.name, phone: input.phone ?? undefined },
  });
  if (error || !data.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? "");
    if (!taken) console.warn("[admin] create_auth_user_failed", { message: error?.message });
    return { ok: false, reason: taken ? "email_taken" : "auth_failed" };
  }

  try {
    const row = await prisma.user.create({
      data: {
        authId: data.user.id,
        email,
        name: input.name,
        phone: input.phone,
        role: input.role,
        staffPermissions: input.staffPermissions,
      },
      select: { id: true },
    });
    // Mesmo vínculo do primeiro login: pedidos feitos sem conta com este e-mail passam para ela.
    await prisma.order.updateMany({ where: { userId: null, customerEmail: email }, data: { userId: row.id } });
    void queueTemplateEmail({
      key: "account_invited",
      to: email,
      toUserId: row.id,
      vars: { customerName: input.name, appLink: `${(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "")}/?entrar=1` },
    });
    const user = await getManagedUser(row.id);
    return user ? { ok: true, user } : { ok: false, reason: "auth_failed" };
  } catch (error) {
    // Banco recusou: desfaz a conta do Auth para não sobrar login sem cadastro.
    await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, reason: "email_taken" };
    }
    throw error;
  }
}

/**
 * Exclusão definitiva da conta. Pedidos ficam (registro fiscal) e se desligam da conta; se a pessoa
 * voltar com o mesmo e-mail, o primeiro login religa. Dossiês e vínculos de empresa saem junto.
 */
export async function deleteManagedUser(id: string): Promise<"ok" | "missing" | "auth_failed"> {
  const row = await prisma.user.findUnique({ where: { id }, select: { authId: true } });
  if (!row) return "missing";

  // Auth primeiro: sem login, a conta não volta a ser criada no primeiro acesso.
  if (row.authId) {
    const { error } = await deleteAuthUser(row.authId);
    if (error && !/not.?found/i.test(error.message)) {
      console.warn("[admin] delete_auth_user_failed", { userId: id, message: error.message });
      return "auth_failed";
    }
  }

  await prisma.$transaction(async (tx) => {
    const dossiers = await tx.dossier.findMany({ where: { userId: id }, select: { id: true } });
    if (dossiers.length) await tx.dossier.deleteMany({ where: { id: { in: dossiers.map((d) => d.id) } } });
    await tx.order.updateMany({ where: { userId: id }, data: { userId: null } });
    await tx.user.delete({ where: { id } });
  });
  return "ok";
}
