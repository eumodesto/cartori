import { NextResponse } from "next/server";
import {
  type AuthContext,
  logAuthzDeny,
  privateNotFoundResponse,
  requireAuth,
  unauthorizedResponse,
} from "@/lib/authorization";
import { getOwnedOrder } from "@/lib/order-store";
import { StoredOrder } from "@/lib/order-types";

export function orderUnauthorizedResponse() {
  return unauthorizedResponse("Entre na conta para ver este pedido.");
}

export function orderNotFoundResponse() {
  return privateNotFoundResponse("Pedido não encontrado.");
}

export async function requireOrderAccess(orderId: string): Promise<
  | { ok: true; context: AuthContext; order: StoredOrder }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return { ok: false, response: orderUnauthorizedResponse() };
    }
    return auth;
  }

  const order = await getOwnedOrder(orderId, auth.context.userId);
  if (!order) {
    logAuthzDeny({
      userId: auth.context.userId,
      role: auth.context.role,
      resourceType: "order",
      resourceId: orderId,
      reason: "order_not_owned",
    });
    return { ok: false, response: orderNotFoundResponse() };
  }

  return { ok: true, context: auth.context, order };
}

/** Compatibility wrapper: personal B2C ownership only (no organization OR). */
export async function loadOwnedOrder(orderId: string): Promise<
  | { context: AuthContext; order: StoredOrder }
  | { response: NextResponse }
> {
  const result = await requireOrderAccess(orderId);
  if (!result.ok) return { response: result.response };
  return { context: result.context, order: result.order };
}
