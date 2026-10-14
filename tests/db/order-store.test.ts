import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getOrderById, nextOrderNumber, saveOrder } from "@/lib/order-store";
import { reconcileFetchedPayment } from "@/lib/payment-reconcile";
import {
  approvedSnapshot,
  cleanupOrders,
  makeStoredOrder,
  readOrderState,
} from "./fixtures/orders";

beforeAll(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(async () => {
  vi.restoreAllMocks();
  await cleanupOrders();
  await prisma.$disconnect();
});

describe("saveOrder", () => {
  it("cria pedido, itens e pagamento com os valores do snapshot", async () => {
    const input = makeStoredOrder();
    const saved = await saveOrder(input);

    expect(saved.id).toBe(input.id);
    expect(saved.status).toBe("PENDING_PAYMENT");
    expect(saved.totalAmount).toBe(105.9);
    expect(saved.items).toHaveLength(1);
    expect(saved.items[0].id).toBe(input.items[0].id);
    expect(saved.payment?.providerPaymentId).toBe(input.payment?.providerPaymentId);
    expect(saved.payment?.amount).toBe(105.9);
  });

  it("cartorioId inexistente no banco é gravado como null", async () => {
    const saved = await saveOrder(makeStoredOrder());
    expect(saved.items[0].cartorioId).toBeUndefined();
    expect(saved.items[0].cartorioName).toBe("Cartório de Teste");
  });

  it("gravar o mesmo pedido de novo não duplica linhas", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await saveOrder(input);

    const state = await readOrderState(input.id);
    expect(state.items).toHaveLength(1);
    expect(state.payments).toHaveLength(1);
  });
});

describe("saveOrder: comportamento atual de defeitos conhecidos", () => {
  it("[F3] novo pagamento sobrescreve a linha anterior; o providerPaymentId antigo fica órfão", async () => {
    const first = makeStoredOrder();
    await saveOrder(first);
    const oldProviderId = first.payment!.providerPaymentId!;
    const oldPaymentRowId = first.payment!.id;

    await saveOrder({
      ...first,
      payment: {
        ...first.payment!,
        id: randomUUID(),
        providerPaymentId: `mp-teste-${randomUUID()}`,
        paymentMethod: "CREDIT_CARD",
      },
    });

    const state = await readOrderState(first.id);
    expect(state.payments).toHaveLength(1);
    expect(state.payments[0].id).toBe(oldPaymentRowId);
    expect(state.payments[0].providerPaymentId).not.toBe(oldProviderId);

    const late = await reconcileFetchedPayment(approvedSnapshot(first));
    expect(late.reason).toBe("unlinked");
  });

  it("[F3] metadata do Payment é substituída por { demo }", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await prisma.payment.updateMany({
      where: { orderId: input.id },
      data: { metadata: { origem: "mercadopago", detalhe: "accredited" } },
    });

    await saveOrder(input);

    const state = await readOrderState(input.id);
    expect(state.payments[0].metadata).toEqual({ demo: false });
  });

  it("[F4] gravar uma cópia antiga desfaz um cancelamento feito no intervalo", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    const staleCopy = await getOrderById(input.id);

    await prisma.order.update({ where: { id: input.id }, data: { status: "CANCELLED" } });
    await saveOrder(staleCopy!);

    expect((await readOrderState(input.id)).status).toBe("PENDING_PAYMENT");
  });

  it("[F6] nextOrderNumber devolve o mesmo número a dois checkouts; o segundo falha", async () => {
    const first = await nextOrderNumber();
    const second = await nextOrderNumber();
    expect(second).toBe(first);

    const a = makeStoredOrder({ orderNumber: first });
    await saveOrder(a);

    const b = makeStoredOrder({ orderNumber: second });
    await expect(saveOrder(b)).rejects.toThrow();
    expect(await prisma.order.count({ where: { id: b.id } })).toBe(0);
  });

  it("[F10] salvar recria os itens e zera status, rastreio e arquivo emitido", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await prisma.orderItem.update({
      where: { id: input.items[0].id },
      data: {
        status: "SHIPPED",
        trackingCode: "BR000000000BR",
        issuedFileUrl: "https://example.invalid/certidao.pdf",
        notes: "observação da mesa",
      },
    });

    const loaded = await getOrderById(input.id);
    await saveOrder(loaded!);

    const [item] = (await readOrderState(input.id)).items;
    expect(item.id).toBe(input.items[0].id);
    expect(item.status).toBe("PENDING_PAYMENT");
    expect(item.trackingCode).toBeNull();
    expect(item.issuedFileUrl).toBeNull();
    expect(item.notes).toBeNull();
  });

});

describe("saveOrder: status e método de pagamento (F11)", () => {
  it.each([
    ["REFUNDED", "BOLETO"],
    ["IN_PROCESS", "B2B_INVOICE"],
    ["APPROVED", "CREDIT_CARD"],
    ["REJECTED", "PIX"],
  ] as const)("carregar e salvar preserva %s / %s", async (status, method) => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await prisma.payment.updateMany({
      where: { orderId: input.id },
      data: { status, paymentMethod: method },
    });

    const loaded = await getOrderById(input.id);
    expect(loaded?.payment?.status).toBe(status);
    expect(loaded?.payment?.paymentMethod).toBe(method);

    await saveOrder(loaded!);

    const [payment] = (await readOrderState(input.id)).payments;
    expect(payment.status).toBe(status);
    expect(payment.paymentMethod).toBe(method);
  });

  it("pagamento novo de PIX e cartão continua gravado como antes", async () => {
    const pix = await saveOrder(makeStoredOrder());
    expect((await readOrderState(pix.id)).payments[0]).toMatchObject({
      paymentMethod: "PIX",
      status: "PENDING",
    });

    const base = makeStoredOrder();
    const card = await saveOrder({
      ...base,
      payment: { ...base.payment!, paymentMethod: "CREDIT_CARD" },
    });
    expect((await readOrderState(card.id)).payments[0]).toMatchObject({
      paymentMethod: "CREDIT_CARD",
      status: "PENDING",
    });
  });
});