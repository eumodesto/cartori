import { NextRequest, NextResponse } from "next/server";
import { fetchCitiesByState } from "@/lib/ibge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uf = searchParams.get("uf");

  if (!uf || uf.length !== 2) {
    return NextResponse.json(
      { success: false, error: "Parâmetro UF inválido ou ausente." },
      { status: 400 }
    );
  }

  try {
    const cities = await fetchCitiesByState(uf);
    return NextResponse.json({ success: true, uf: uf.toUpperCase(), cities });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao carregar municípios" },
      { status: 500 }
    );
  }
}
