import { NextRequest, NextResponse } from "next/server";
import { loadOwnedOrder } from "@/lib/order-access";
import { toClientOrder } from "@/lib/orders";
import { ensureCardChargeForOrder, isCardPayment } from "@/lib/payments";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await loadOwnedOrder(params.id);
    if ("response" in result) return result.response;

    const order = result.order;

    if (!isCardPayment(order)) {
      return NextResponse.json(
        { success: false, error: "Este pedido não é pagamento com cartão." },
        { status: 400 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, order: toClientOrder(order) });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { success: false, error: "Este pedido não aceita pagamento agora." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const charged = await ensureCardChargeForOrder(order, body);

    return NextResponse.json({
      success: true,
      order: toClientOrder(charged),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao pagar com cartão.";
    console.error("Erro POST /api/orders/[id]/card:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
