import { NextRequest, NextResponse } from "next/server";
import { listAccountAlerts, markAlertsRead, markAllAlertsRead } from "@/lib/account-alerts";
import { requireAuth } from "@/lib/authorization";

async function gate() {
  const auth = await requireAuth();
  if (!auth.ok && auth.response.status === 401) {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, error: "Entre na conta para ver os alertas." }, { status: 401 }),
    };
  }
  return auth;
}

export async function GET() {
  const auth = await gate();
  if (!auth.ok) return auth.response;
  const { alerts, unread } = await listAccountAlerts(auth.context);
  return NextResponse.json({ success: true, alerts, unread });
}

/** Lido salvo no servidor: { all: true } marca tudo; { ids: [...] } marca alertas específicos. */
export async function POST(req: NextRequest) {
  const auth = await gate();
  if (!auth.ok) return auth.response;
  const body = (await req.json().catch(() => ({}))) as { all?: unknown; ids?: unknown };
  if (body.all === true) {
    await markAllAlertsRead(auth.context.userId);
  } else if (Array.isArray(body.ids)) {
    await markAlertsRead(auth.context.userId, body.ids.filter((id): id is string => typeof id === "string"));
  } else {
    return NextResponse.json({ success: false, error: "Nada para marcar." }, { status: 400 });
  }
  const { alerts, unread } = await listAccountAlerts(auth.context);
  return NextResponse.json({ success: true, alerts, unread });
}
