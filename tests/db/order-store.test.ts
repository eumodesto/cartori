import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  createOrder,
  getOrderById,
  protocolFromNumber,
  saveOrder,
} from "@/lib/order-store";
import type { OrderDraft } from "@/lib/order-types";
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
  it("[F4] gravar uma cópia antiga desfaz um cancelamento feito no intervalo", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    const staleCopy = await getOrderById(input.id);

    await prisma.order.update({ where: { id: input.id }, data: { status: "CANCELLED" } });
    await saveOrder(staleCopy!);

    expect((await readOrderState(input.id)).status).toBe("PENDING_PAYMENT");
  });
});

describe("saveOrder: cobranças anteriores são preservadas (F3, compatibilidade)", () => {
  it.each([
    ["mesmo id de linha", (old: string) => old],
    ["id de linha novo", () => randomUUID()],
  ])("outra cobrança vira linha nova (%s); o webhook da antiga continua vinculado", async (_label, rowId) => {
    const first = makeStoredOrder();
    await saveOrder(first);
    const old = (await readOrderState(first.id)).payments[0];

    const secondProviderId = `mp-teste-${randomUUID()}`;
    await saveOrder({
      ...first,
      payment: { ...first.payment!, id: rowId(old.id), providerPaymentId: secondProviderId },
    });

    const payments = (await readOrderState(first.id)).payments;
    expect(payments).toHaveLength(2);
    expect(payments.find((p) => p.id === old.id)).toMatchObject({
      providerPaymentId: old.providerPaymentId,
      status: "PENDING",
    });
    expect(payments.some((p) => p.providerPaymentId === secondProviderId)).toBe(true);

    const late = await reconcileFetchedPayment(approvedSnapshot(first));
    expect(late).toMatchObject({ reason: "paid", orderId: first.id });
  });

  it("trocar o método de uma linha já cobrada cria linha nova sem copiar o providerPaymentId", async () => {
    const pix = makeStoredOrder();
    await saveOrder(pix);

    await saveOrder({ ...pix, payment: { ...pix.payment!, paymentMethod: "CREDIT_CARD" } });

    const payments = (await readOrderState(pix.id)).payments;
    expect(payments).toHaveLength(2);
    expect(payments.find((p) => p.paymentMethod === "PIX")?.providerPaymentId).toBe(
      pix.payment!.providerPaymentId
    );
    expect(payments.find((p) => p.paymentMethod === "CREDIT_CARD")?.providerPaymentId).toBeNull();
  });

  it("linha sem cobrança no provedor continua sendo atualizada no lugar", async () => {
    const base = makeStoredOrder();
    const placeholder = {
      ...base,
      payment: { ...base.payment!, paymentMethod: "CREDIT_CARD" as const, providerPaymentId: undefined },
    };
    await saveOrder(placeholder);

    const providerPaymentId = `mp-teste-${randomUUID()}`;
    await saveOrder({ ...placeholder, payment: { ...placeholder.payment, providerPaymentId } });

    const payments = (await readOrderState(base.id)).payments;
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ id: base.payment!.id, providerPaymentId });
  });

  it("metadata existente é mesclada, não substituída", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await prisma.payment.updateMany({
      where: { orderId: input.id },
      data: { metadata: { origem: "mercadopago", detalhe: "accredited" } },
    });

    await saveOrder(input);

    const state = await readOrderState(input.id);
    expect(state.payments[0].metadata).toEqual({
      origem: "mercadopago",
      detalhe: "accredited",
      demo: false,
    });
  });
});

describe("saveOrder: itens não são recriados (F10)", () => {
  it("preserva status, rastreio, arquivo emitido e observações da mesa", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    const operational = {
      status: "SHIPPED",
      trackingCode: "BR000000000BR",
      issuedFileUrl: "https://example.invalid/certidao.pdf",
      notes: "observação da mesa",
    } as const;
    await prisma.orderItem.update({ where: { id: input.items[0].id }, data: operational });
    const before = (await readOrderState(input.id)).items[0];

    const loaded = await getOrderById(input.id);
    await saveOrder(loaded!);

    const [item] = (await readOrderState(input.id)).items;
    expect(item).toMatchObject({ id: input.items[0].id, ...operational });
    expect(item.createdAt).toEqual(before.createdAt);
  });

  it("insere um item ausente sem tocar nos existentes", async () => {
    const input = makeStoredOrder();
    await saveOrder(input);
    await prisma.orderItem.update({
      where: { id: input.items[0].id },
      data: { trackingCode: "BR111111111BR" },
    });

    const extra = { ...input.items[0], id: randomUUID() };
    await saveOrder({ ...input, items: [...input.items, extra] });

    const items = (await readOrderState(input.id)).items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === input.items[0].id)?.trackingCode).toBe("BR111111111BR");
  });
});

function makeDraft(): OrderDraft {
  return makeStoredOrder();
}

async function maxOrderNumber() {
  const { _max } = await prisma.order.aggregate({ _max: { orderNumber: true } });
  return _max.orderNumber ?? 1000;
}

describe("createOrder (F6)", () => {
  it("grava pedido e itens sem cobrança, com número = máximo + 1 e protocolo derivado", async () => {
    const max = await maxOrderNumber();
    const draft = makeDraft();

    const order = await createOrder(draft);

    expect(order.id).toBe(draft.id);
    expect(order.orderNumber).toBe(max + 1);
    expect(order.protocol).toBe(protocolFromNumber(max + 1));
    expect(order.status).toBe("PENDING_PAYMENT");
    expect(order.payment).toBeNull();
    expect(order.items.map((i) => i.id)).toEqual(draft.items.map((i) => i.id));
    expect((await readOrderState(order.id)).payments).toHaveLength(0);
  });

  it("20 criações simultâneas recebem números distintos e contíguos", async () => {
    const max = await maxOrderNumber();
    const orders = await Promise.all(
      Array.from({ length: 20 }, () => createOrder(makeDraft()))
    );

    const numbers = orders.map((o) => o.orderNumber).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => max + 1 + i));
    expect(new Set(orders.map((o) => o.protocol)).size).toBe(20);
  });

  it("controle: sem o advisory lock, a mesma carga colide (o teste detecta a corrida)", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        prisma.$transaction(
          async (tx) => {
            const { _max } = await tx.order.aggregate({ _max: { orderNumber: true } });
            await tx.$executeRaw`SELECT pg_sleep(0.1)`;
            const order = makeStoredOrder({ orderNumber: (_max.orderNumber ?? 1000) + 1 });
            await tx.order.create({
              data: {
                id: order.id,
                orderNumber: order.orderNumber,
                protocol: order.protocol,
                totalAmount: order.totalAmount,
                itemsTotal: order.itemsTotal,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                customerCpfCnpj: order.customerCpfCnpj,
              },
            });
          },
          { maxWait: 10_000, timeout: 10_000 }
        )
      )
    );

    expect(results.some((r) => r.status === "rejected")).toBe(true);
  });

  it("esgotadas as tentativas por conflito, falha sem gravar nada", async () => {
    const blockerNumber = (await maxOrderNumber()) + 100;
    await saveOrder(
      makeStoredOrder({
        orderNumber: blockerNumber,
        protocol: protocolFromNumber(blockerNumber + 1),
      })
    );
    const draft = makeDraft();

    await expect(createOrder(draft)).rejects.toMatchObject({ code: "P2002" });
    expect(await prisma.order.count({ where: { id: draft.id } })).toBe(0);
    expect(await prisma.orderItem.count({ where: { orderId: draft.id } })).toBe(0);
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