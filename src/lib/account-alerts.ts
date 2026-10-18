import { CaseAuthorKind, CaseEventType, OrderStatus, UserRole } from "@prisma/client";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {

  ALERT_ID_PATTERN,
  DAY_MS,
  RETENTION_DAYS,
  RETENTION_REMINDER_DAYS,
  STALE_CUSTOMER_DAYS,
  STALE_PAID_DAYS,
  type UnreadAlert,
  applyReadState,
  daysBetween,
  previewText,
  sortAndLimit,
  statusAlertCopy,
} from "@/lib/alert-rules";
import type { AuthContext } from "@/lib/authorization-policy";
import { DISPLAY_STATUS_META, type DisplayOrderStatus, displayOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export type { AccountAlert } from "@/lib/alert-rules";

const TAKE = 20;
const OWNED_ORDER_TAKE = 80;
const STAFF_WINDOW_DAYS = 14;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function eventDisplay(payload: Record<string, unknown>): DisplayOrderStatus | null {
  const display = String(payload.display || "");
  if (display in DISPLAY_STATUS_META) return display as DisplayOrderStatus;
  const to = String(payload.to || "");
  return to ? displayOrderStatus(to) : null;
}

function formatDay(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

/** Alertas dos próprios pedidos e dossiês (userId). Membership não amplia a lista. */
async function customerAlerts(userId: string, now: Date): Promise<UnreadAlert[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: { id: true, protocol: true, status: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
    take: OWNED_ORDER_TAKE,
  });
  const byId = new Map(orders.map((order) => [order.id, order]));
  const orderIds = orders.map((order) => order.id);
  const link = (orderId: string) => `/painel/pedidos/${orderId}`;

  const [messages, events, attachments, dossiers] = await Promise.all([
    orderIds.length
      ? prisma.caseMessage.findMany({
          where: { orderId: { in: orderIds }, authorKind: { in: [CaseAuthorKind.STAFF, CaseAuthorKind.SYSTEM] } },
          orderBy: { createdAt: "desc" },
          take: TAKE,
          select: { id: true, orderId: true, body: true, createdAt: true },
        })
      : [],
    orderIds.length
      ? prisma.caseEvent.findMany({
          where: { orderId: { in: orderIds }, type: CaseEventType.STATUS_CHANGED },
          orderBy: { createdAt: "desc" },
          take: TAKE,
          select: { id: true, orderId: true, payload: true, createdAt: true },
        })
      : [],
    orderIds.length
      ? prisma.caseAttachment.findMany({
          // Arquivo que a equipe pôs no pedido (o que o próprio cliente enviou não vira alerta).
          where: { orderId: { in: orderIds }, OR: [{ uploadedByUserId: null }, { uploadedByUserId: { not: userId } }] },
          orderBy: { createdAt: "desc" },
          take: TAKE,
          select: { id: true, orderId: true, kind: true, originalName: true, createdAt: true },
        })
      : [],
    prisma.dossier.findMany({
      where: { userId, status: { in: ["READY", "PARTIAL"] } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, protocol: true, status: true, title: true, updatedAt: true },
    }),
  ]);

  const alerts: UnreadAlert[] = [];

  for (const message of messages) {
    const order = byId.get(message.orderId);
    if (!order) continue;
    alerts.push({
      id: `message:${message.id}`,
      kind: "message",
      audience: "customer",
      tone: "info",
      title: "Nova mensagem",
      body: previewText(message.body) || "A equipe InterJuri enviou uma mensagem.",
      href: link(order.id),
      protocol: order.protocol,
      createdAt: message.createdAt.toISOString(),
    });
  }

  for (const event of events) {
    const order = byId.get(event.orderId);
    if (!order) continue;
    const payload = asRecord(event.payload);
    if (payload.display === "CANCEL_REQUESTED" || payload.source === "cancel_rejected") {
      const requested = payload.display === "CANCEL_REQUESTED";
      alerts.push({
        id: `status:${event.id}`,
        kind: "status",
        audience: "customer",
        tone: requested ? "warning" : "error",
        title: requested ? "Cancelamento solicitado" : "Cancelamento não aprovado",
        body: requested
          ? "Recebemos o pedido. O setor responsável confirma por e-mail em até 2 dias úteis."
          : previewText(typeof payload.note === "string" && payload.note ? payload.note : "O pedido segue normalmente."),
        href: link(order.id),
        protocol: order.protocol,
        createdAt: event.createdAt.toISOString(),
      });
      continue;
    }
    const display = eventDisplay(payload);
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const label = display ? DISPLAY_STATUS_META[display].label : "Atualizado";
    const copy = statusAlertCopy(display, "customer");
    alerts.push({
      id: `status:${event.id}`,
      kind: display?.startsWith("PAYMENT") || display === "REFUNDED" ? "payment" : "status",
      audience: "customer",
      tone: copy.tone,
      title: copy.title,
      body: note ? previewText(`${label}. ${note}`) : `Pedido ${order.protocol}: ${label}.`,
      href: link(order.id),
      protocol: order.protocol,
      createdAt: event.createdAt.toISOString(),
    });
  }

  for (const file of attachments) {
    const order = byId.get(file.orderId);
    if (!order) continue;
    const isCertificate = file.kind === "CERTIDAO";
    alerts.push({
      id: `document:${file.id}`,
      kind: "document",
      audience: "customer",
      tone: isCertificate ? "success" : "info",
      title: isCertificate ? "Certidão disponível" : "Novo documento no pedido",
      body: isCertificate ? "Baixe o PDF no pedido e guarde uma cópia." : file.originalName,
      href: link(order.id),
      protocol: order.protocol,
      createdAt: file.createdAt.toISOString(),
    });
    // Lembrete antes de o PDF sair do painel (30 dias após a entrega).
    const age = daysBetween(file.createdAt, now);
    if (isCertificate && age >= RETENTION_REMINDER_DAYS && age < RETENTION_DAYS) {
      const until = new Date(file.createdAt.getTime() + RETENTION_DAYS * DAY_MS);
      alerts.push({
        id: `retention:${file.id}`,
        kind: "document",
        audience: "customer",
        tone: "warning",
        title: "Baixe sua certidão",
        body: `O PDF fica no painel até ${formatDay(until)}. Depois disso é apagado.`,
        href: link(order.id),
        protocol: order.protocol,
        createdAt: new Date(file.createdAt.getTime() + RETENTION_REMINDER_DAYS * DAY_MS).toISOString(),
      });
    }
  }

  for (const order of orders) {
    if (order.status !== OrderStatus.PENDING_PAYMENT) continue;
    alerts.push({
      id: `pending:${order.id}`,
      kind: "payment",
      audience: "customer",
      tone: "warning",
      title: "Pagamento pendente",
      body: "O pedido só começa depois do pagamento. Pague por PIX ou cartão.",
      href: `/painel/pedidos?pay=${order.id}`,
      protocol: order.protocol,
      createdAt: order.createdAt.toISOString(),
    });
  }

  for (const dossier of dossiers) {
    const ready = dossier.status === "READY";
    alerts.push({
      id: `dossier:${dossier.id}:${dossier.status}`,
      kind: "dossier",
      audience: "customer",
      tone: ready ? "success" : "info",
      title: ready ? "Dossiê pronto" : "Dossiê com resultado parcial",
      body: dossier.title,
      href: `/painel/dossies/${dossier.id}`,
      protocol: dossier.protocol,
      createdAt: dossier.updatedAt.toISOString(),
    });
  }

  return alerts;
}

/** Fila da equipe (OPERATOR e ADMIN): o que pede ação em qualquer pedido. */
async function staffAlerts(context: AuthContext, now: Date): Promise<UnreadAlert[]> {
  const since = new Date(now.getTime() - STAFF_WINDOW_DAYS * DAY_MS);
  const link = (orderId: string) => `/operacao/pedidos/${orderId}`;
  const orderSelect = { select: { id: true, protocol: true, customerName: true } } as const;
  const canEmails = hasAdminPermission(context.platformRole, context.adminPermissions, "emails");
  const canUsers = hasAdminPermission(context.platformRole, context.adminPermissions, "users");

  const [messages, uploads, events, newPending, stalePaid, staleCustomer, failedEmails, signups, cancellations] =
    await Promise.all([
      prisma.caseMessage.findMany({
        where: { authorKind: CaseAuthorKind.CLIENT, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: TAKE,
        select: { id: true, body: true, createdAt: true, order: orderSelect },
      }),
      prisma.caseAttachment.findMany({
        where: { createdAt: { gte: since }, uploadedBy: { role: UserRole.CLIENT } },
        orderBy: { createdAt: "desc" },
        take: TAKE,
        select: { id: true, kind: true, originalName: true, createdAt: true, order: orderSelect },
      }),
      prisma.caseEvent.findMany({
        where: { type: CaseEventType.STATUS_CHANGED, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 60,
        select: { id: true, payload: true, createdAt: true, order: orderSelect },
      }),
      prisma.order.findMany({
        where: { status: OrderStatus.PENDING_PAYMENT, createdAt: { gte: new Date(now.getTime() - 3 * DAY_MS) } },
        orderBy: { createdAt: "desc" },
        take: TAKE,
        select: { id: true, protocol: true, customerName: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.IN_ANALYSIS, OrderStatus.IN_CARTORIO_SEARCH] },
          updatedAt: { lt: new Date(now.getTime() - STALE_PAID_DAYS * DAY_MS) },
        },
        orderBy: { updatedAt: "asc" },
        take: TAKE,
        select: { id: true, protocol: true, customerName: true, updatedAt: true },
      }),
      prisma.order.findMany({
        where: {
          status: OrderStatus.WAITING_CUSTOMER,
          updatedAt: { lt: new Date(now.getTime() - STALE_CUSTOMER_DAYS * DAY_MS) },
        },
        orderBy: { updatedAt: "asc" },
        take: TAKE,
        select: { id: true, protocol: true, customerName: true, updatedAt: true },
      }),
      canEmails
        ? prisma.emailOutbox.findMany({
            // Falha, ou pendente há mais de 10 minutos (sem chave, remetente recusado…).
            where: {
              createdAt: { gte: new Date(now.getTime() - 7 * DAY_MS) },
              OR: [{ status: "FAILED" }, { status: "PENDING", createdAt: { lt: new Date(now.getTime() - 10 * 60 * 1000) } }],
            },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: { id: true, createdAt: true },
          })
        : [],
      canUsers
        ? prisma.user.findMany({
            where: { createdAt: { gte: new Date(now.getTime() - 7 * DAY_MS) } },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: { id: true, createdAt: true },
          })
        : [],
      prisma.cancellationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: TAKE,
        select: { id: true, reason: true, createdAt: true, order: orderSelect },
      }),
    ]);

  const alerts: UnreadAlert[] = [];

  for (const message of messages) {
    alerts.push({
      id: `staff-message:${message.id}`,
      kind: "message",
      audience: "staff",
      tone: "info",
      title: `Mensagem de ${message.order.customerName}`,
      body: previewText(message.body),
      href: link(message.order.id),
      protocol: message.order.protocol,
      createdAt: message.createdAt.toISOString(),
    });
  }

  for (const file of uploads) {
    alerts.push({
      id: `staff-document:${file.id}`,
      kind: "document",
      audience: "staff",
      tone: "info",
      title: "Cliente enviou documento",
      body: `${file.order.customerName}: ${file.originalName}`,
      href: link(file.order.id),
      protocol: file.order.protocol,
      createdAt: file.createdAt.toISOString(),
    });
  }

  for (const event of events) {
    const display = eventDisplay(asRecord(event.payload));
    if (display !== "PAYMENT_APPROVED" && display !== "PAYMENT_REJECTED" && display !== "REFUNDED") continue;
    const copy = statusAlertCopy(display, "staff");
    alerts.push({
      id: `staff-status:${event.id}`,
      kind: "payment",
      audience: "staff",
      tone: copy.tone,
      title: copy.title,
      body: event.order.customerName,
      href: link(event.order.id),
      protocol: event.order.protocol,
      createdAt: event.createdAt.toISOString(),
    });
  }

  for (const request of cancellations) {
    alerts.push({
      id: `staff-cancel:${request.id}`,
      kind: "payment",
      audience: "staff",
      tone: "warning",
      title: "Cancelamento solicitado",
      body: `${request.order.customerName}: ${previewText(request.reason, 100)}`,
      href: link(request.order.id),
      protocol: request.order.protocol,
      createdAt: request.createdAt.toISOString(),
    });
  }

  for (const order of newPending) {
    alerts.push({
      id: `staff-order:${order.id}`,
      kind: "order",
      audience: "staff",
      tone: "info",
      title: "Novo pedido aguardando pagamento",
      body: order.customerName,
      href: link(order.id),
      protocol: order.protocol,
      createdAt: order.createdAt.toISOString(),
    });
  }

  // Parado: o id leva a data da última mudança, então volta a avisar se ficar parado de novo.
  for (const order of stalePaid) {
    alerts.push({
      id: `stale:${order.id}:${order.updatedAt.getTime()}`,
      kind: "stale",
      audience: "staff",
      tone: "warning",
      title: `Pedido pago parado há ${daysBetween(order.updatedAt, now)} dias`,
      body: order.customerName,
      href: link(order.id),
      protocol: order.protocol,
      createdAt: new Date(order.updatedAt.getTime() + STALE_PAID_DAYS * DAY_MS).toISOString(),
    });
  }
  for (const order of staleCustomer) {
    alerts.push({
      id: `stale-customer:${order.id}:${order.updatedAt.getTime()}`,
      kind: "stale",
      audience: "staff",
      tone: "warning",
      title: `Cliente sem responder há ${daysBetween(order.updatedAt, now)} dias`,
      body: order.customerName,
      href: link(order.id),
      protocol: order.protocol,
      createdAt: new Date(order.updatedAt.getTime() + STALE_CUSTOMER_DAYS * DAY_MS).toISOString(),
    });
  }

  if (failedEmails.length) {
    alerts.push({
      id: `email-failed:${failedEmails[0].id}`,
      kind: "email",
      audience: "staff",
      tone: "error",
      title: `${failedEmails.length} e-mail(s) não enviado(s)`,
      body: "Falhas ou pendências nos últimos 7 dias. Veja o registro de envios e reenvie.",
      href: "/admin/emails",
      createdAt: failedEmails[0].createdAt.toISOString(),
    });
  }

  if (signups.length) {
    alerts.push({
      id: `signups:${signups[0].id}`,
      kind: "signup",
      audience: "staff",
      tone: "info",
      title: `${signups.length} novo(s) cadastro(s)`,
      body: "Contas criadas nos últimos 7 dias.",
      href: "/admin/usuarios",
      createdAt: signups[0].createdAt.toISOString(),
    });
  }

  return alerts;
}

export async function listAccountAlerts(context: AuthContext, now: Date = new Date()) {
  const isStaff = context.platformRole === "ADMIN" || context.platformRole === "OPERATOR";
  const [own, staff, user, reads] = await Promise.all([
    customerAlerts(context.userId, now),
    isStaff ? staffAlerts(context, now) : Promise.resolve([] as UnreadAlert[]),
    prisma.user.findUnique({ where: { id: context.userId }, select: { alertsSeenAt: true } }),
    prisma.alertRead.findMany({ where: { userId: context.userId }, select: { alertId: true } }),
  ]);
  const alerts = applyReadState(
    sortAndLimit([...staff, ...own]),
    user?.alertsSeenAt ?? null,
    new Set(reads.map((row) => row.alertId))
  );
  return { alerts, unread: alerts.filter((alert) => !alert.read).length };
}

/** "Marcar todos": grava a data e limpa as marcações uma a uma, que deixam de ser necessárias. */
export async function markAllAlertsRead(userId: string, now: Date = new Date()) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { alertsSeenAt: now } }),
    prisma.alertRead.deleteMany({ where: { userId } }),
  ]);
}

export async function markAlertsRead(userId: string, ids: string[]) {
  const valid = Array.from(new Set(ids.filter((id) => ALERT_ID_PATTERN.test(id)))).slice(0, 50);
  if (!valid.length) return 0;
  const result = await prisma.alertRead.createMany({
    data: valid.map((alertId) => ({ userId, alertId })),
    skipDuplicates: true,
  });
  return result.count;
}
