import { NextResponse } from "next/server";
import {
  type AuthContext,
  canOperateCases,
  logAuthzDeny,
  privateNotFoundResponse,
  requireAuth,
  unauthorizedResponse,
} from "@/lib/authorization";
import { getCaseOrder } from "@/lib/case-store";

type CaseOrder = NonNullable<Awaited<ReturnType<typeof getCaseOrder>>>;

function caseUnauthorized() {
  return unauthorizedResponse("Entre na conta para continuar.");
}

function caseNotFound() {
  return privateNotFoundResponse("Pedido não encontrado.");
}

export async function requireStaffOps(): Promise<
  { ok: true; context: AuthContext } | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return { ok: false, response: caseUnauthorized() };
    }
    return auth;
  }
  if (!canOperateCases(auth.context)) {
    logAuthzDeny({
      userId: auth.context.userId,
      role: auth.context.role,
      resourceType: "ops.orders",
      reason: "not_operator",
    });
    return { ok: false, response: caseNotFound() };
  }
  return { ok: true, context: auth.context };
}

export async function requireOrderCaseAccess(orderId: string): Promise<
  | { ok: true; context: AuthContext; order: CaseOrder; staff: boolean }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return { ok: false, response: caseUnauthorized() };
    }
    return auth;
  }

  const order = await getCaseOrder(orderId);
  const staff = canOperateCases(auth.context);
  const owned = Boolean(order?.userId) && order?.userId === auth.context.userId;

  if (!order || (!staff && !owned)) {
    logAuthzDeny({
      userId: auth.context.userId,
      role: auth.context.role,
      resourceType: "order.case",
      resourceId: orderId,
      reason: staff ? "order_missing" : "order_not_owned",
    });
    return { ok: false, response: caseNotFound() };
  }

  return { ok: true, context: auth.context, order, staff };
}
