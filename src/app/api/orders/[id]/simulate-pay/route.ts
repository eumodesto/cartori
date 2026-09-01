import { NextRequest, NextResponse } from "next/server";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getOrderById } from "@/lib/order-store";
import { publicOrder } from "@/lib/orders";
import { markOrderPaid } from "@/lib/payments";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isMercadoPagoConfigured()) {
    return NextResponse.json(
      { success: false, error: "Simulação indisponível neste ambiente." },
      { status: 403 }
    );
  }

  const order = await getOrderById(params.id);
  if (!order) {
    return NextResponse.json(
      { success: false, error: "Pedido não encontrado." },
      { status: 404 }
    );
  }

  const paid = await markOrderPaid(order);
  return NextResponse.json({ success: true, order: publicOrder(paid) });
}
