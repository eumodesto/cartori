import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "A simulação de pagamento foi desativada." },
    { status: 403 }
  );
}
