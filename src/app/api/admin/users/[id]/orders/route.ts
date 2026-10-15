import { NextRequest, NextResponse } from "next/server";
import { listAdminUserOrders } from "@/lib/admin-orders";
import { requirePlatformAdmin } from "@/lib/authorization";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePlatformAdmin("admin.users.orders");
  if (!gate.ok) return gate.response;

  const orders = await listAdminUserOrders(params.id);
  return NextResponse.json({ success: true, orders });
}
