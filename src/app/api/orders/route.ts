import { NextRequest, NextResponse } from "next/server";
import { runInBackground } from "@/lib/background";
import { pendingCancellationOrderIds } from "@/lib/cancellation-store";
import { orderOwnerFromContext, requireAuth } from "@/lib/authorization";
import { queueTemplateEmail } from "@/lib/email";
import { createOrder, listOrdersByUser } from "@/lib/order-store";
import { buildOrderDraft, toClientOrder } from "@/lib/orders";
import {
  chargeCardForOrder,
  issuePixForOrder,
  prepareCardOrder,
} from "@/lib/payments";
import { notifyAdmins } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { digitsOnly, formatCurrency } from "@/lib/utils";
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
  const pending = await pendingCancellationOrderIds(orders.map((order) => order.id));
  return NextResponse.json({
    success: true,
    orders: orders.map((order) => ({ ...toClientOrder(order), cancelRequested: pending.has(order.id) })),
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
    // Só grava o perfil quando algo mudou: cada ida ao banco pesa no tempo do checkout.
    const nextName = String(customer.fullName || "").trim() || current?.name;
    const nextPhone = digitsOnly(customer.phone || "") || current?.phone;
    const addCpf = Boolean(cpfDigits && !current?.cpf);
    try {
      if (nextName !== current?.name || nextPhone !== current?.phone || addCpf) {
        await prisma.user.update({
          where: { id: auth.context.userId },
          data: { name: nextName, phone: nextPhone, ...(addCpf ? { cpf: cpfDigits } : {}) },
        });
      }
    } catch {
      // CPF duplicado não transfere identidade e não deve impedir o pedido.
    }

    const draft = await buildOrderDraft(
      { customer, items },
      orderOwnerFromContext(auth.context)
    );
    const order = await createOrder(draft);

    // Notificações do pedido depois da resposta (waitUntil): não atrasam o checkout e não se perdem.
    const orderLink = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://interjuri.com.br").replace(/\/$/, "")}/painel/pedidos/${order.id}`;
    const itemsList = order.items
      .map((item) => `- ${item.certificateName} (${item.city}/${item.state})`)
      .join("\n");
    const notifications: Promise<unknown>[] = [];
    notifications.push(queueTemplateEmail({
      key: "order_created",
      to: order.customerEmail,
      toUserId: order.userId,
      orderId: order.id,
      vars: {
        customerName: order.customerName,
        protocol: order.protocol,
        total: formatCurrency(order.totalAmount),
        itemsList,
        orderLink,
      },
    }));
    notifications.push(notifyAdmins("admin_order_pending", order.id));
    if (
      order.items.some(
        (item) => item.certificateType === "certidao-negativa-de-testamento"
      )
    ) {
      notifications.push(queueTemplateEmail({
        key: "docs_request_testamento",
        to: order.customerEmail,
        toUserId: order.userId,
        orderId: order.id,
        vars: {
          customerName: order.customerName,
          protocol: order.protocol,
          orderLink,
        },
      }));
    }

    runInBackground("order_notifications", Promise.all(notifications));

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
