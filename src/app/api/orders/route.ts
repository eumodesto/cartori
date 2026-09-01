import { NextRequest, NextResponse } from "next/server";
import { saveOrder } from "@/lib/order-store";
import { buildStoredOrder, publicOrder } from "@/lib/orders";
import { issuePixForOrder } from "@/lib/payments";
import {
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
} from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = body.customer;
    const items = body.items;

    if (!customer || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Pedido incompleto." },
        { status: 400 }
      );
    }

    if (!customer.fullName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Informe o nome completo." },
        { status: 400 }
      );
    }
    if (!isValidEmail(customer.email || "")) {
      return NextResponse.json(
        { success: false, error: "E-mail inválido." },
        { status: 400 }
      );
    }
    if (!isValidPhone(customer.phone || "")) {
      return NextResponse.json(
        { success: false, error: "Telefone inválido." },
        { status: 400 }
      );
    }
    if (!isValidCpfCnpj(customer.cpfCnpj || "")) {
      return NextResponse.json(
        { success: false, error: "CPF/CNPJ inválido." },
        { status: 400 }
      );
    }

    const order = await buildStoredOrder({ customer, items });
    await saveOrder(order);
    const withPayment = await issuePixForOrder(order);

    return NextResponse.json({
      success: true,
      order: publicOrder(withPayment),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar o pedido.";
    console.error("Erro POST /api/orders:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
