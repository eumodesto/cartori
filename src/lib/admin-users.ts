import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import {
  type AuthContext,
  canManageUsers,
  forbiddenResponse,
  logAuthzDeny,
  requireAuth,
  unauthorizedResponse,
} from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";

/**
 * Administração de usuários/clientes (ADMIN only).
 * Fail-closed: sessão + User Prisma + platformRole ADMIN. OPERATOR NÃO gerencia.
 * Papel/organização/dono nunca vêm do browser para autorizar.
 */
export async function requireUserManagement(): Promise<
  { ok: true; context: AuthContext } | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return { ok: false, response: unauthorizedResponse("Entre na conta para continuar.") };
    }
    return auth;
  }
  if (!canManageUsers(auth.context)) {
    logAuthzDeny({
      userId: auth.context.userId,
      role: auth.context.role,
      resourceType: "admin.users",
      reason: "not_admin",
    });
    return { ok: false, response: forbiddenResponse() };
  }
  return { ok: true, context: auth.context };
}

export const MANAGEABLE_ROLES: readonly UserRole[] = ["CLIENT", "OPERATOR", "ADMIN"] as const;

export function isManageableRole(value: unknown): value is UserRole {
  return typeof value === "string" && (MANAGEABLE_ROLES as readonly string[]).includes(value);
}

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
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
}): Promise<ManagedUser | null> {
  const data: Prisma.UserUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.role !== undefined) data.role = input.role;

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
