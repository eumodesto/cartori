import { NextRequest, NextResponse } from "next/server";
import { paymentClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || searchParams.get("topic");
    const dataId = searchParams.get("data.id") || searchParams.get("id");

    if (type === "payment" && dataId) {
      // Consulta o status atualizado do pagamento no Mercado Pago
      const paymentInfo = await paymentClient.get({ id: dataId });
      
      console.log(`[Mercado Pago Webhook] Pagamento ID: ${dataId} | Status: ${paymentInfo.status} | ExternalRef: ${paymentInfo.external_reference}`);

      // Aqui o status é atualizado no banco de dados (Prisma/Supabase)
      // se paymentInfo.status === 'approved' -> OrderStatus = PAID
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Erro no Webhook Mercado Pago:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
