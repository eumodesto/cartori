import { NextRequest, NextResponse } from "next/server";
import {
  findApprovedPaymentByExternalReference,
  getPaymentById,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";
import { getOrderById } from "@/lib/order-store";
import { publicOrder } from "@/lib/orders";
import {
  ensurePixForOrder,
  hasLivePix,
  isCardPayment,
  markOrderPaid,
} from "@/lib/payments";

function queryPaymentId(req: NextRequest) {
  const paymentId =
    req.nextUrl.searchParams.get("payment_id") ||
    req.nextUrl.searchParams.get("collection_id") ||
    "";
  if (!paymentId || paymentId === "null" || paymentId.startsWith("demo-")) {
    return "";
  }
  return paymentId;
}

export async function GET(
  req: NextRequest,
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

    let paymentError: string | undefined;
    const paymentId = queryPaymentId(req);

    if (order.status === "PENDING_PAYMENT") {
      if (isCardPayment(order)) {
        if (!isMercadoPagoConfigured()) {
          paymentError =
            "Mercado Pago não está configurado. Defina MERCADOPAGO_ACCESS_TOKEN.";
        }
      } else if (!hasLivePix(order)) {
        if (!isMercadoPagoConfigured()) {
          paymentError =
            "Mercado Pago não está configurado. Defina MERCADOPAGO_ACCESS_TOKEN.";
        } else {
          try {
            order = await ensurePixForOrder(order);
          } catch (error) {
            console.error("Falha ao emitir PIX Mercado Pago:", error);
            paymentError =
              error instanceof Error
                ? error.message
                : "Não foi possível gerar o QR Code PIX.";
          }
        }
      }

      try {
        const lookupId =
          paymentId ||
          (!isCardPayment(order) &&
          hasLivePix(order) &&
          order.payment?.providerPaymentId &&
          !order.payment.providerPaymentId.startsWith("demo-")
            ? order.payment.providerPaymentId
            : "");

        const payment = lookupId
          ? await getPaymentById(lookupId)
          : isCardPayment(order)
            ? await findApprovedPaymentByExternalReference(order.id)
            : null;

        const matchesOrder =
          !payment?.external_reference ||
          String(payment.external_reference) === order.id;

        if (payment?.status === "approved" && matchesOrder && payment.id) {
          order = await markOrderPaid({
            ...order,
            payment: order.payment
              ? { ...order.payment, providerPaymentId: String(payment.id) }
              : order.payment,
          });
        }
      } catch (error) {
        console.error("Falha ao consultar pagamento Mercado Pago:", error);
      }
    }

    return NextResponse.json({
      success: true,
      order: publicOrder(order),
      paymentError,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
