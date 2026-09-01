import { NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/mercadopago";
import { findOrderByPaymentId, getOrderById } from "@/lib/order-store";
import { markOrderPaid } from "@/lib/payments";

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let type = searchParams.get("type") || searchParams.get("topic");
    let dataId = searchParams.get("data.id") || searchParams.get("id");

    if (!type || !dataId) {
      const body = await req.json().catch(() => null);
      type = type || body?.type || body?.action;
      dataId = dataId || body?.data?.id || body?.id;
    }

    if (type?.includes("payment") && dataId) {
      const paymentInfo = await getPaymentById(String(dataId));
      const externalRef = String(paymentInfo.external_reference || "");
      const byPayment = await findOrderByPaymentId(String(dataId));
      const order = byPayment || (externalRef ? await getOrderById(externalRef) : null);

      if (order && paymentInfo.status === "approved") {
        await markOrderPaid(order);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro no webhook Mercado Pago.";
    console.error("Erro no Webhook Mercado Pago:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
