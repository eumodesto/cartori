import { NextRequest, NextResponse } from "next/server";
import { loadOwnedOrder } from "@/lib/order-access";
import { toClientOrder } from "@/lib/orders";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await loadOwnedOrder(params.id);
    if ("response" in result) return result.response;

    return NextResponse.json({
      success: true,
      order: toClientOrder(result.order),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
