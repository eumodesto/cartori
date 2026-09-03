import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

export class WebhookSecretMissingError extends Error {
  constructor() {
    super("Mercado Pago webhook secret is not configured.");
    this.name = "WebhookSecretMissingError";
  }
}

export function getMercadoPagoWebhookSecret(): string {
  return (process.env.MERCADOPAGO_WEBHOOK_SECRET || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function isMercadoPagoWebhookSecretConfigured(): boolean {
  return getMercadoPagoWebhookSecret().length > 0;
}

export function assertMercadoPagoWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): void {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) {
    throw new WebhookSecretMissingError();
  }

  WebhookSignatureValidator.validate({
    xSignature: input.xSignature,
    xRequestId: input.xRequestId,
    dataId: input.dataId,
    secret,
  });
}

export { InvalidWebhookSignatureError };
