import type { AuthContext } from "@/lib/authorization-policy";
import { prisma } from "@/lib/prisma";

/** Amanda é do cliente, no painel, depois que a conta já tem um pedido. */
export function isAmandaClient(context: AuthContext) {
  return context.platformRole === "CLIENT";
}

export async function clientHasPurchase(userId: string) {
  const order = await prisma.order.findFirst({
    where: { userId },
    select: { id: true },
  });
  return Boolean(order);
}
