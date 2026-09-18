import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import {
  isManageableRole,
  listManagedUsers,
  requireUserManagement,
} from "@/lib/admin-users";

export async function GET(req: NextRequest) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get("role");
  const q = searchParams.get("q") || undefined;
  const role: UserRole | undefined = isManageableRole(roleParam) ? roleParam : undefined;

  const users = await listManagedUsers({ role, q });
  return NextResponse.json({ success: true, users });
}
