import { NextRequest, NextResponse } from "next/server";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { requireStaffOps } from "@/lib/case-access";
import { getOrderJourney, resolveCancellation } from "@/lib/cancellation-store";
import { sanitizeCaseBody } from "@/lib/case-types";

/**
 * Equipe responde ao pedido de cancelamento.
 * - reject: OPERATOR ou ADMIN; o pedido segue.
 * - approve: só ADMIN com "payments" (registra o estorno, como o pagamento manual).
 *   O dinheiro volta pelo Mercado Pago ou banco; aqui só registra e cancela o pedido.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireStaffOps();
  if (!staff.ok) return staff.response;

  const body = (await req.json().catch(() => ({}))) as { action?: unknown; note?: unknown };
  const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;
  if (!action) return NextResponse.json({ success: false, error: "Ação inválida." }, { status: 400 });

  if (
    action === "approve" &&
    !hasAdminPermission(staff.context.platformRole, staff.context.adminPermissions, "payments")
  ) {
    return NextResponse.json(
      { success: false, error: "Aprovar estorno exige administrador com permissão de pagamento manual." },
      { status: 403 }
    );
  }

  const note = sanitizeCaseBody(body.note);
  if (action === "reject" && note.length < 5) {
    return NextResponse.json({ success: false, error: "Explique ao cliente por que o cancelamento não foi aprovado." }, { status: 400 });
  }

  const result = await resolveCancellation({ orderId: params.id, actorUserId: staff.context.userId, action, note });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });

  console.warn("[orders] cancellation_resolved", { orderId: params.id, actorUserId: staff.context.userId, action });
  const journey = await getOrderJourney(params.id);
  return NextResponse.json({ success: true, journey });
}
