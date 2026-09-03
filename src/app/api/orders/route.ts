import { NextRequest, NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";
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
} from "@/lib/validators";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Entre na conta para ver seus pedidos." },
      { status: 401 }
    );
  }
  const orders = await listOrdersByUser(profile.id, profile.organization?.id);
  return NextResponse.json({
    success: true,
    orders: orders.map(toClientOrder),
  });
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getAuthProfile();
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Crie ou entre na conta para concluir o pedido." },
        { status: 401 }
      );
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

    const cpfDigits = digitsOnly(customer.cpfCnpj || "");
    try {
      await prisma.user.update({
        where: { id: profile.id },
        data: {
          name: String(customer.fullName || "").trim() || profile.name,
          phone: digitsOnly(customer.phone || "") || profile.phone,
          ...(cpfDigits.length === 11 ? { cpf: cpfDigits } : {}),
        },
      });
    } catch {
      // CPF duplicado ou dado já existente não deve impedir o pedido.
    }

    const order = await buildStoredOrder(
      { customer, items },
      { userId: profile.id, organizationId: profile.organization?.id }
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
