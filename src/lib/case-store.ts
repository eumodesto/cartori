import {
  CaseAttachmentKind,
  CaseAuthorKind,
  CaseEventType,
  OrderStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PublicOrderCase } from "@/lib/case-types";

const caseOrderSelect = {
  id: true,
  protocol: true,
  status: true,
  userId: true,
  customerName: true,
  customerEmail: true,
  createdAt: true,
  items: {
    select: { certificateName: true, city: true, state: true },
  },
} satisfies Prisma.OrderSelect;

export async function getCaseOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: caseOrderSelect,
  });
}

export async function listOpsOrders(take = 80) {
  return prisma.order.findMany({
    select: {
      id: true,
      protocol: true,
      status: true,
      userId: true,
      customerName: true,
      customerEmail: true,
      createdAt: true,
      items: { select: { certificateName: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function loadOrderCase(orderId: string): Promise<PublicOrderCase | null> {
  const order = await getCaseOrder(orderId);
  if (!order) return null;

  const [messages, attachments, events] = await Promise.all([
    prisma.caseMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.caseAttachment.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.caseEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    order: {
      id: order.id,
      protocol: order.protocol,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt.toISOString(),
      items: order.items,
    },
    messages: messages.map((row) => ({
      id: row.id,
      authorKind: row.authorKind,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    })),
    attachments: attachments.map((row) => ({
      id: row.id,
      kind: row.kind,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
    })),
    events: events.map((row) => ({
      id: row.id,
      type: row.type,
      payload: row.payload,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function postCaseMessage(input: {
  orderId: string;
  authorUserId: string;
  authorKind: CaseAuthorKind;
  body: string;
}) {
  const message = await prisma.caseMessage.create({
    data: {
      orderId: input.orderId,
      authorUserId: input.authorUserId,
      authorKind: input.authorKind,
      body: input.body,
    },
  });
  await prisma.caseEvent.create({
    data: {
      orderId: input.orderId,
      actorUserId: input.authorUserId,
      type: CaseEventType.MESSAGE_POSTED,
      payload: { messageId: message.id, authorKind: input.authorKind },
    },
  });
  return message;
}

export async function createCaseAttachment(input: {
  orderId: string;
  uploadedByUserId: string;
  kind: CaseAttachmentKind;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}) {
  const attachment = await prisma.caseAttachment.create({ data: input });
  await prisma.caseEvent.create({
    data: {
      orderId: input.orderId,
      actorUserId: input.uploadedByUserId,
      type: CaseEventType.ATTACHMENT_UPLOADED,
      payload: {
        attachmentId: attachment.id,
        kind: input.kind,
        originalName: input.originalName,
      },
    },
  });
  return attachment;
}

export async function getCaseAttachment(orderId: string, attachmentId: string) {
  return prisma.caseAttachment.findFirst({
    where: { id: attachmentId, orderId },
  });
}

export async function updateOrderOperationalStatus(input: {
  orderId: string;
  actorUserId: string;
  nextStatus: OrderStatus;
  note?: string;
}) {
  const current = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { status: true },
  });
  if (!current) return null;

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: input.orderId },
      data: { status: input.nextStatus },
      select: caseOrderSelect,
    });
    await tx.caseEvent.create({
      data: {
        orderId: input.orderId,
        actorUserId: input.actorUserId,
        type: CaseEventType.STATUS_CHANGED,
        payload: {
          from: current.status,
          to: input.nextStatus,
          note: input.note || null,
        },
      },
    });
    if (input.note) {
      await tx.caseMessage.create({
        data: {
          orderId: input.orderId,
          authorUserId: input.actorUserId,
          authorKind: CaseAuthorKind.STAFF,
          body: input.note,
        },
      });
    }
    return updated;
  });

  return { previous: current.status, order };
}
