import { MercadoPagoConfig, Payment } from "mercadopago";
import { createId } from "@/lib/utils";

function getPaymentClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  const client = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 15000 },
  });
  return new Payment(client);
}

export function isMercadoPagoConfigured(): boolean {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  return token.startsWith("APP_USR-") || token.startsWith("TEST-");
}

function webhookNotificationUrl(): string | undefined {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!site) return undefined;
  if (site.includes("localhost") || site.includes("127.0.0.1")) return undefined;
  if (!site.startsWith("https://")) return undefined;
  return `${site}/api/payments/webhook`;
}

function mercadopagoErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Falha ao gerar cobrança PIX no Mercado Pago";
  }

  const err = error as {
    message?: string;
    cause?: Array<{ description?: string; message?: string; code?: string }>;
  };

  if (Array.isArray(err.cause) && err.cause.length > 0) {
    const details = err.cause
      .map((item) => item.description || item.message || item.code)
      .filter(Boolean)
      .join(" · ");
    if (details) return details;
  }

  return err.message || "Falha ao gerar cobrança PIX no Mercado Pago";
}

export async function getPaymentById(id: string) {
  return getPaymentClient().get({ id });
}

export interface CreatePixPaymentInput {
  orderId: string;
  orderNumber: number;
  amount: number;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification: {
      type: "CPF" | "CNPJ";
      number: string;
    };
  };
}

export async function createPixPayment(input: CreatePixPaymentInput) {
  try {
    const notificationUrl = webhookNotificationUrl();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const response = await getPaymentClient().create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: input.description,
        payment_method_id: "pix",
        date_of_expiration: expiresAt,
        payer: {
          email: input.payer.email,
          first_name: input.payer.first_name,
          last_name: input.payer.last_name || "",
          identification: {
            type: input.payer.identification.type,
            number: input.payer.identification.number.replace(/\D/g, ""),
          },
        },
        external_reference: input.orderId,
        metadata: {
          order_id: input.orderId,
          order_number: String(input.orderNumber),
        },
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      },
      requestOptions: {
        idempotencyKey: createId(),
      },
    });

    const transactionData = response.point_of_interaction?.transaction_data;

    if (!transactionData?.qr_code) {
      throw new Error("O Mercado Pago não retornou o QR Code PIX.");
    }

    return {
      paymentId: String(response.id),
      status: response.status,
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64 || "",
      ticketUrl: transactionData.ticket_url || "",
    };
  } catch (error: unknown) {
    console.error("Erro Mercado Pago PIX:", error);
    throw new Error(mercadopagoErrorMessage(error));
  }
}
