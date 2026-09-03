import { MercadoPagoConfig, MerchantOrder, Payment } from "mercadopago";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createId } from "@/lib/utils";

function traceMercadoPago(op: string) {
  try {
    const dir = join(process.cwd(), "node_modules", ".cache");
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, "cartori-mp-trace.log"), `${Date.now()} ${op}\n`);
  } catch {
    // Tracing is best-effort evidence for authorization tests.
  }
}

export function getMercadoPagoAccessToken(): string {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function getMercadoPagoConfig() {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente.");
  }
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 15000 },
  });
}

function getPaymentClient() {
  return new Payment(getMercadoPagoConfig());
}

export function getMercadoPagoPublicKey(): string {
  return (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function isMercadoPagoConfigured(): boolean {
  const token = getMercadoPagoAccessToken();
  return token.startsWith("APP_USR-") || token.startsWith("TEST-");
}

export function normalizeQrBase64(value?: string | null): string {
  if (!value) return "";
  return value.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
}

export async function pixQrPngBase64(payload: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#111827", light: "#ffffff" },
  });
  return normalizeQrBase64(dataUrl);
}

function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function webhookNotificationUrl(): string | undefined {
  const site = siteBaseUrl();
  if (!site) return undefined;
  if (site.includes("localhost") || site.includes("127.0.0.1")) return undefined;
  if (!site.startsWith("https://")) return undefined;
  return `${site}/api/payments/webhook`;
}

function mercadopagoErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
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

  return err.message || fallback;
}

export async function getPaymentById(id: string) {
  traceMercadoPago(`getPaymentById`);
  return getPaymentClient().get({ id });
}

export async function getMerchantOrderById(id: string) {
  return new MerchantOrder(getMercadoPagoConfig()).get({ merchantOrderId: id });
}

export interface CheckoutPayerInput {
  email: string;
  first_name: string;
  last_name?: string;
  identification: {
    type: "CPF" | "CNPJ";
    number: string;
  };
}

export interface CreateCheckoutPaymentInput {
  orderId: string;
  orderNumber: number;
  amount: number;
  description: string;
  payer: CheckoutPayerInput;
}

export async function createPixPayment(input: CreateCheckoutPaymentInput) {
  traceMercadoPago("createPixPayment");
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

    const qrCodeBase64 =
      normalizeQrBase64(transactionData.qr_code_base64) ||
      (await pixQrPngBase64(transactionData.qr_code));

    return {
      paymentId: String(response.id),
      status: response.status,
      qrCode: transactionData.qr_code,
      qrCodeBase64,
      ticketUrl: transactionData.ticket_url || "",
    };
  } catch (error: unknown) {
    console.error("Erro Mercado Pago PIX:", error);
    throw new Error(
      mercadopagoErrorMessage(error, "Falha ao gerar cobrança PIX no Mercado Pago")
    );
  }
}

export interface CreateCardPaymentInput extends CreateCheckoutPaymentInput {
  token: string;
  installments: number;
  paymentMethodId: string;
  issuerId?: string | number;
}

export function parseCardPaymentForm(body: unknown): Omit<
  CreateCardPaymentInput,
  keyof CreateCheckoutPaymentInput
> {
  const data = (body || {}) as Record<string, unknown>;
  // token/bandeira/parcelas vêm do Brick; transaction_amount do browser é ignorado.
  const token = String(data.token || "").trim();
  // transaction_amount e demais valores do Brick não determinam a cobrança.
  const paymentMethodId = String(data.payment_method_id || data.paymentMethodId || "").trim();
  const installments = Number(data.installments);
  const issuerRaw = data.issuer_id ?? data.issuerId;
  const issuerId =
    issuerRaw === undefined || issuerRaw === null || issuerRaw === ""
      ? undefined
      : String(issuerRaw);

  if (!token) {
    throw new Error("Token do cartão ausente. Preencha os dados do cartão.");
  }
  if (!paymentMethodId) {
    throw new Error("Bandeira do cartão não identificada.");
  }
  if (!Number.isInteger(installments) || installments < 1) {
    throw new Error("Informe o número de parcelas.");
  }

  return { token, installments, paymentMethodId, issuerId };
}

export async function createCardPayment(input: CreateCardPaymentInput) {
  traceMercadoPago("createCardPayment");
  try {
    const notificationUrl = webhookNotificationUrl();
    const issuerId = input.issuerId ? Number(input.issuerId) : undefined;

    const response = await getPaymentClient().create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        token: input.token,
        description: input.description,
        installments: input.installments,
        payment_method_id: input.paymentMethodId,
        ...(Number.isFinite(issuerId) ? { issuer_id: issuerId } : {}),
        statement_descriptor: "CARTORI",
        three_d_secure_mode: "optional",
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

    return {
      paymentId: String(response.id),
      status: response.status || "pending",
      statusDetail: response.status_detail || "",
    };
  } catch (error: unknown) {
    console.error("Erro Mercado Pago cartão:", error);
    throw new Error(
      mercadopagoErrorMessage(error, "Falha ao processar o cartão no Mercado Pago")
    );
  }
}
