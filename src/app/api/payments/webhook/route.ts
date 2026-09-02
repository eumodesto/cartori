import { NextRequest, NextResponse } from "next/server";
import { getMerchantOrderById, getPaymentById } from "@/lib/mercadopago";
import { findOrderByPaymentId, getOrderById } from "@/lib/order-store";
import { markOrderPaid } from "@/lib/payments";
import { StoredOrder } from "@/lib/order-types";

async function approveIfPaid(order: StoredOrder, paymentId?: string) {
  if (order.status === "PAID") return;
  await markOrderPaid({
    ...order,
    payment: order.payment
      ? {
          ...order.payment,
          providerPaymentId: paymentId || order.payment.providerPaymentId,
          status: "APPROVED",
        }
      : order.payment,
  });
}

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

    const topic = String(type || "").toLowerCase();

    if (topic.includes("merchant_order") && dataId) {
      const merchantOrder = await getMerchantOrderById(String(dataId));
      const approved = (merchantOrder.payments || []).find(
        (item) => item.status === "approved" && item.id
      );
      const externalRef = String(merchantOrder.external_reference || "");
      const byPayment = approved?.id
        ? await findOrderByPaymentId(String(approved.id))
        : null;
      const byPreference = merchantOrder.preference_id
        ? await findOrderByPaymentId(String(merchantOrder.preference_id))
        : null;
      const order =
        byPayment ||
        byPreference ||
        (externalRef ? await getOrderById(externalRef) : null);
      if (order && approved?.id) {
        await approveIfPaid(order, String(approved.id));
      }
    } else if (topic.includes("payment") && dataId) {
      const paymentInfo = await getPaymentById(String(dataId));
      const externalRef = String(paymentInfo.external_reference || "");
      const byPayment = await findOrderByPaymentId(String(dataId));
      const order = byPayment || (externalRef ? await getOrderById(externalRef) : null);

      if (order && paymentInfo.status === "approved") {
        await approveIfPaid(order, String(dataId));
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
