import { NextRequest, NextResponse } from "next/server";
import { fetchAddressByCep } from "@/lib/viacep";

export async function GET(
  _req: NextRequest,
  { params }: { params: { cep: string } }
) {
  const { cep } = params;

  try {
    const address = await fetchAddressByCep(cep);
    if (!address) {
      return NextResponse.json(
        { success: false, error: "CEP não encontrado ou inválido." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao consultar CEP" },
      { status: 500 }
    );
  }
}
