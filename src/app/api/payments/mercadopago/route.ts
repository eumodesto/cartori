import { NextRequest, NextResponse } from "next/server";
import { createPixPayment } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, amount, description, payer } = body;

    if (!orderId || !amount || !payer?.email || !payer?.identification?.number) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos para geração do pagamento via Mercado Pago." },
        { status: 400 }
      );
    }

    const pixResult = await createPixPayment({
      orderId,
      orderNumber: orderNumber || 1,
      amount: Number(amount),
      description: description || `Pedido Cartori #${orderNumber || orderId}`,
      payer: {
        email: payer.email,
        first_name: payer.first_name || payer.name || "Cliente",
        last_name: payer.last_name || "",
        identification: {
          type: payer.identification.type || "CPF",
          number: payer.identification.number,
        },
      },
    });

    return NextResponse.json({ success: true, payment: pixResult });
  } catch (error: any) {
    console.error("Erro API Mercado Pago:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro no processamento com Mercado Pago" },
      { status: 500 }
    );
  }
}
