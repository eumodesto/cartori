import { NextRequest, NextResponse } from "next/server";
import { requireOrderCaseAccess } from "@/lib/case-access";
import { CANCEL_REASON_MIN, sanitizeCancelReason } from "@/lib/cancellation-policy";
import { getOrderJourney, requestCancellation } from "@/lib/cancellation-store";
import { loadOrderCase } from "@/lib/case-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Cliente pede o cancelamento do próprio pedido (dono do pedido, não a equipe).
 * Regras e valores vêm do servidor (cancellation-policy); o browser só manda o motivo e o aceite.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limit = rateLimit(`order-cancel:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: "Muitas tentativas. Espere alguns minutos." }, { status: 429 });
  }
  const access = await requireOrderCaseAccess(params.id);
  if (!access.ok) return access.response;
  if (access.order.userId !== access.context.userId) {
    return NextResponse.json({ success: false, error: "Só o titular do pedido pode pedir o cancelamento." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { reason?: unknown; accepted?: unknown };
  const reason = sanitizeCancelReason(body.reason);
  if (reason.length < CANCEL_REASON_MIN) {
    return NextResponse.json({ success: false, error: "Conte em poucas palavras o motivo do cancelamento." }, { status: 400 });
  }
  if (body.accepted !== true) {
    return NextResponse.json({ success: false, error: "É preciso aceitar a política de cancelamento." }, { status: 400 });
  }

  const result = await requestCancellation({ orderId: params.id, userId: access.context.userId, reason });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });

  const [data, journey] = await Promise.all([loadOrderCase(params.id, "customer"), getOrderJourney(params.id)]);
  return NextResponse.json({ success: true, outcome: result.outcome, ...data, journey, staff: false });
}
