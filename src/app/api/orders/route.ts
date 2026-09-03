import { NextRequest, NextResponse } from "next/server";
import { orderOwnerFromContext, requireAuth } from "@/lib/authorization";
import { saveOrder, listOrdersByUser } from "@/lib/order-store";
import { buildStoredOrder, toClientOrder } from "@/lib/orders";
import {
  chargeCardForOrder,
  issuePixForOrder,
  prepareCardOrder,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import {
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
  normalizeCpf,
} from "@/lib/validators";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para ver seus pedidos." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const orders = await listOrdersByUser(auth.context.userId);
  return NextResponse.json({
    success: true,
    orders: orders.map(toClientOrder),
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      if (auth.response.status === 401) {
        return NextResponse.json(
          { success: false, error: "Crie ou entre na conta para concluir o pedido." },
          { status: 401 }
        );
      }
      return auth.response;
    }

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

    const paymentMethod =
      body.paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX";

    const cpfDigits = normalizeCpf(customer.cpfCnpj || "");
    const current = await prisma.user.findUnique({
      where: { id: auth.context.userId },
      select: { name: true, phone: true, cpf: true },
    });
    try {
      await prisma.user.update({
        where: { id: auth.context.userId },
        data: {
          name: String(customer.fullName || "").trim() || current?.name,
          phone: digitsOnly(customer.phone || "") || current?.phone,
          ...(cpfDigits && !current?.cpf ? { cpf: cpfDigits } : {}),
        },
      });
    } catch {
      // CPF duplicado não transfere identidade e não deve impedir o pedido.
    }

    const order = await buildStoredOrder(
      { customer, items },
      orderOwnerFromContext(auth.context)
    );
    await saveOrder(order);

    if (paymentMethod === "CREDIT_CARD") {
      const prepared = await prepareCardOrder(order);
      if (!body.card) {
        return NextResponse.json({
          success: true,
          order: toClientOrder(prepared),
        });
      }
      try {
        const charged = await chargeCardForOrder(prepared, body.card);
        return NextResponse.json({
          success: true,
          order: toClientOrder(charged),
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Erro ao pagar com cartão.";
        console.error("Erro cartão POST /api/orders:", error);
        return NextResponse.json(
          { success: false, error: message, order: toClientOrder(prepared) },
          { status: 402 }
        );
      }
    }

    const withPayment = await issuePixForOrder(order);
    return NextResponse.json({
      success: true,
      order: toClientOrder(withPayment),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar o pedido.";
    console.error("Erro POST /api/orders:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
