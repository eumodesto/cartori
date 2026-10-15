import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { isManageableRole, listManagedUsers } from "@/lib/admin-users";
import { requirePlatformAdmin } from "@/lib/authorization";

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
