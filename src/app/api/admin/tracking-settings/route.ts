import { NextRequest, NextResponse } from "next/server";
import { requireUserManagement } from "@/lib/admin-users";
import { parseTrackingInput } from "@/lib/tracking";
import { getTrackingConfigFresh, saveTrackingConfig } from "@/lib/tracking-settings";

export async function GET() {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const settings = await getTrackingConfigFresh();
  return NextResponse.json({ success: true, settings });
}

export async function PUT(req: NextRequest) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => ({}));
  const parsed = parseTrackingInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, error: parsed.error, field: parsed.field },
      { status: 400 }
    );
  }

  await saveTrackingConfig(parsed.config);
  return NextResponse.json({ success: true, settings: parsed.config });
}
