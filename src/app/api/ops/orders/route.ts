import { NextResponse } from "next/server";
import { requireStaffOps } from "@/lib/case-access";
import { listOpsOrders } from "@/lib/case-store";

export async function GET() {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;

  const orders = await listOpsOrders();
  return NextResponse.json({
    success: true,
    orders: orders.map((order) => ({
      id: order.id,
      protocol: order.protocol,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt.toISOString(),
      certificates: order.items.map((item) => item.certificateName),
    })),
  });
}
