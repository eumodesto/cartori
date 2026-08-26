import { MercadoPagoConfig, Payment } from "mercadopago";

// Inicializa o cliente do Mercado Pago com o Access Token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  options: { timeout: 10000 },
});

export const paymentClient = new Payment(client);

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
    const response = await paymentClient.create({
      body: {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: input.description,
        payment_method_id: "pix",
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
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
      },
    });

    const pointOfInteraction = response.point_of_interaction;
    const transactionData = pointOfInteraction?.transaction_data;

    return {
      paymentId: String(response.id),
      status: response.status,
      qrCode: transactionData?.qr_code || "",
      qrCodeBase64: transactionData?.qr_code_base64 || "",
      ticketUrl: transactionData?.ticket_url || "",
    };
  } catch (error: any) {
    console.error("Erro Mercado Pago PIX:", error);
    throw new Error(error?.message || "Falha ao gerar cobrança PIX no Mercado Pago");
  }
}
