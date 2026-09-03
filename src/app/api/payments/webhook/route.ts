import { NextRequest, NextResponse } from "next/server";
import { getMerchantOrderById } from "@/lib/mercadopago";
import {
  assertMercadoPagoWebhookSignature,
  InvalidWebhookSignatureError,
  WebhookSecretMissingError,
} from "@/lib/mercadopago-webhook";
import { reconcileMercadoPagoPayment } from "@/lib/payment-reconcile";

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Webhook não autorizado." },
    { status: 401 }
  );
}

function received() {
  return NextResponse.json({ received: true });
}

function notificationDataId(
  searchParams: URLSearchParams,
  body: Record<string, unknown> | null
): string | null {
  const fromQuery = searchParams.get("data.id") || searchParams.get("id");
  const fromBody = body?.data && typeof body.data === "object" && body.data
    ? String((body.data as { id?: unknown }).id || "")
    : "";
  const value = (fromQuery || fromBody || "").trim();
  return value || null;
}

function notificationType(
  searchParams: URLSearchParams,
  body: Record<string, unknown> | null
): string {
  return String(
    searchParams.get("type") ||
      searchParams.get("topic") ||
      body?.type ||
      body?.action ||
      ""
  ).toLowerCase();
}

function merchantOrderPaymentIds(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const payments = (raw as { payments?: Array<{ id?: string | number }> }).payments;
  if (!Array.isArray(payments)) return [];
  return payments
    .map((item) => String(item?.id || "").trim())
    .filter(Boolean);
}

export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const dataId = notificationDataId(searchParams, body);

  try {
    assertMercadoPagoWebhookSignature({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
    });
  } catch (error) {
    if (
      error instanceof WebhookSecretMissingError ||
      error instanceof InvalidWebhookSignatureError
    ) {
      console.warn("[payments] invalid_signature", {
        reason:
          error instanceof InvalidWebhookSignatureError
            ? error.reason
            : "secret_missing",
        requestId: req.headers.get("x-request-id") || undefined,
      });
      return unauthorized();
    }
    throw error;
  }

  if (!dataId) {
    return received();
  }

  try {
    const topic = notificationType(searchParams, body);

    if (topic.includes("merchant_order")) {
      const merchantOrder = await getMerchantOrderById(dataId);
      for (const paymentId of merchantOrderPaymentIds(merchantOrder)) {
        await reconcileMercadoPagoPayment(paymentId);
      }
      return received();
    }

    if (topic.includes("payment") || !topic) {
      await reconcileMercadoPagoPayment(dataId);
    }

    return received();
  } catch (error: unknown) {
    console.error("Erro no Webhook Mercado Pago:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar notificação." },
      { status: 500 }
    );
  }
}
