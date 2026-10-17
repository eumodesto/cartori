import { NextResponse } from "next/server";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { staffTransitionTargets } from "@/lib/authorization-policy";
import { requireStaffOps } from "@/lib/case-access";
import { listOpsOrders } from "@/lib/case-store";
import { canDeleteOrder } from "@/lib/order-bulk";

export async function GET() {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;

  const canDelete = hasAdminPermission(
    staff.context.platformRole,
    staff.context.adminPermissions,
    "orders_delete"
  );
  const orders = await listOpsOrders();
  return NextResponse.json({
    success: true,
    canDelete,
    orders: orders.map((order) => ({
      id: order.id,
      protocol: order.protocol,
      status: order.status,
      paymentStatus: order.payments[0]?.status ?? null,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt.toISOString(),
      certificates: order.items.map((item) => item.certificateName),
      allowedStatuses: staffTransitionTargets(order.status, {
        hasApprovedPayment: order.payments.some((payment) => payment.status === "APPROVED"),
      }),
      deletable: canDelete && canDeleteOrder(order.status, order.payments),
    })),
  });
}
