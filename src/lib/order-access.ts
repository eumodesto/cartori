import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
import { getOwnedOrder } from "@/lib/order-store";
import { StoredOrder } from "@/lib/order-types";
import { AuthProfile } from "@/lib/auth-types";

export function orderUnauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Entre na conta para ver este pedido." },
    { status: 401 }
  );
}

export function orderNotFoundResponse() {
  return NextResponse.json(
    { success: false, error: "Pedido não encontrado." },
    { status: 404 }
  );
}

export async function loadOwnedOrder(orderId: string): Promise<
  | { profile: AuthProfile; order: StoredOrder }
  | { response: NextResponse }
> {
  const profile = await getAuthProfile();
  if (!profile) return { response: orderUnauthorizedResponse() };

  const order = await getOwnedOrder(orderId, profile.id);
  if (!order) return { response: orderNotFoundResponse() };

  return { profile, order };
}
