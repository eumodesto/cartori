import { NextResponse } from "next/server";
import { listAccountAlerts } from "@/lib/account-alerts";
import { requireAuth } from "@/lib/authorization";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para ver os alertas." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const alerts = await listAccountAlerts(auth.context.userId);
  return NextResponse.json({ success: true, alerts });
}
