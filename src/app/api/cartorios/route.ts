import { NextRequest, NextResponse } from "next/server";
import { getCartoriosByCityAndCategory } from "@/lib/cartorios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uf = searchParams.get("uf");
  const city = searchParams.get("city");
  const category = searchParams.get("category") || "geral";

  if (!uf || !city) {
    return NextResponse.json(
      { success: false, error: "Parâmetros UF e Cidade são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const cartorios = await getCartoriosByCityAndCategory(uf, city, category);
    const sources = [...new Set(cartorios.map((item) => item.source ?? "unknown"))];
    return NextResponse.json({
      success: true,
      uf,
      city,
      category,
      source: sources.length === 1 ? sources[0] : "mixed",
      fallback: sources.some((source) => source !== "database"),
      cartorios,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao consultar serventias" },
      { status: 500 }
    );
  }
}
