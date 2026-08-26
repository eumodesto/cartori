import { NextResponse } from "next/server";
import { fetchStates } from "@/lib/ibge";

export async function GET() {
  try {
    const states = await fetchStates();
    return NextResponse.json({ success: true, states });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao carregar estados" },
      { status: 500 }
    );
  }
}
