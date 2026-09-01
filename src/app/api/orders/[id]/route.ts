import { NextRequest, NextResponse } from "next/server";
import { getPaymentById, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getOrderById } from "@/lib/order-store";
import { publicOrder } from "@/lib/orders";
import { markOrderPaid } from "@/lib/payments";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    if (
      order.status === "PENDING_PAYMENT" &&
      order.payment?.providerPaymentId &&
      !order.payment.demo &&
      isMercadoPagoConfigured()
    ) {
      try {
        const payment = await getPaymentById(order.payment.providerPaymentId);
        if (payment.status === "approved") {
          order = await markOrderPaid(order);
        }
      } catch (error) {
        console.error("Falha ao consultar pagamento Mercado Pago:", error);
      }
    }

    return NextResponse.json({ success: true, order: publicOrder(order) });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
