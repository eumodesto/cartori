import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-store";
import { publicOrder } from "@/lib/orders";
import { ensureCardChargeForOrder, isCardPayment } from "@/lib/payments";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    if (!isCardPayment(order)) {
      return NextResponse.json(
        { success: false, error: "Este pedido não é pagamento com cartão." },
        { status: 400 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, order: publicOrder(order) });
    }

    const body = await req.json().catch(() => ({}));
    const charged = await ensureCardChargeForOrder(order, body);

    return NextResponse.json({
      success: true,
      order: publicOrder(charged),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao pagar com cartão.";
    console.error("Erro POST /api/orders/[id]/card:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
