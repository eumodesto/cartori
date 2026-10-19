import { listUserOrderJourneys } from "@/lib/cancellation-store";
import { deadlineText, journeyCopy } from "@/lib/order-journey";
import { CANCEL_REQUESTED_META, displayOrderStatus, displayStatusMeta } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

/**
 * Contexto da conta logada para a Amanda (server-only). Só dados do próprio usuário (userId),
 * sem CPF, cartão ou senha: o suficiente para responder "como está meu pedido", "posso cancelar",
 * "quanto falta". Nunca entra no prompt de outra pessoa.
 */
export async function buildAmandaAccountContext(userId: string): Promise<string> {
  const [user, journeys, dossiers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        cpf: true,
        createdAt: true,
        organizationMemberships: {
          where: { status: "ACTIVE" },
          select: { organization: { select: { name: true } } },
          take: 1,
        },
      },
    }),
    listUserOrderJourneys(userId, 8),
    prisma.dossier.count({ where: { userId } }),
  ]);
  if (!user) return "Conta não encontrada.";

  const company = user.organizationMemberships[0]?.organization?.name;
  const lines = [
    `Nome: ${user.name || "não informado"}`,
    `E-mail da conta: ${user.email}`,
    `Telefone cadastrado: ${user.phone ? "sim" : "não"}`,
    `CPF cadastrado: ${user.cpf ? "sim" : "não (o checkout pede no primeiro pedido)"}`,
    `Tipo de conta: ${company ? `empresa (${company})` : "pessoal"}`,
    `Cliente desde: ${user.createdAt.toLocaleDateString("pt-BR")}`,
    `Dossiês: ${dossiers}`,
    `Pedidos (mais recentes primeiro, até 8):`,
  ];

  if (journeys.length === 0) lines.push("- Nenhum pedido ainda.");

  for (const { order, journey } of journeys) {
    const latestPayment = order.payments[0]?.status ?? null;
    const pendingCancel = journey.request?.status === "PENDING";
    const display = displayOrderStatus(order.status, latestPayment);
    const label = pendingCancel ? CANCEL_REQUESTED_META.label : displayStatusMeta(order.status, latestPayment).label;
    const copy = journeyCopy(pendingCancel ? "CANCEL_REQUESTED" : display, order.status);
    const items = order.items.map((item) => `${item.certificateName} (${item.city}/${item.state})`).join("; ");
    const certificateFiles = order.caseAttachments.filter(
      (file) => file.kind === "CERTIDAO" && file.uploadedByUserId !== order.userId
    ).length;
    const lastMessage = order.caseMessages[0];
    const option = journey.cancellation;
    const cancelText =
      option.kind === "cancel_unpaid"
        ? option.allowed
          ? "pode cancelar agora, sem custo (botão no acompanhamento do pedido)"
          : `ainda não: ${option.reason}`
        : option.kind === "refund"
          ? option.allowed
            ? `pode pedir cancelamento e estorno até ${new Date(option.deadline).toLocaleDateString("pt-BR")}; estorno de ${formatCurrency(option.refundAmount)} (taxa de serviço de ${formatCurrency(option.fee)} retida)`
            : `não pode: ${option.reason}`
          : pendingCancel
            ? `pedido de cancelamento em análise desde ${new Date(journey.request!.createdAt).toLocaleDateString("pt-BR")}; estorno previsto ${formatCurrency(journey.request!.refundAmount)}`
            : "não se aplica";

    lines.push(
      [
        `- Pedido ${order.protocol} · feito em ${order.createdAt.toLocaleDateString("pt-BR")} · ${formatCurrency(Number(order.totalAmount))}`,
        `  Certidões: ${items}`,
        `  Status: ${label}. ${copy.text}`,
        `  Prazo: ${deadlineText(journey.deadline) ?? "sem previsão para este status"}`,
        `  Certidão disponível para baixar: ${certificateFiles > 0 ? "sim, em Documentos do pedido" : "ainda não"}`,
        `  Última mensagem: ${lastMessage ? `${lastMessage.authorKind === "CLIENT" ? "do cliente" : "da equipe"} em ${lastMessage.createdAt.toLocaleDateString("pt-BR")}` : "nenhuma"}`,
        `  Cancelamento: ${cancelText}`,
      ].join("\n")
    );
  }

  return lines.join("\n");
}
