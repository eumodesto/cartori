import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fetchAddressByCep } from "@/lib/viacep";

export async function GET(
  req: NextRequest,
  { params }: { params: { cep: string } }
) {
  const limit = rateLimit(`cep:${clientIp(req)}`, 30, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Muitas consultas de CEP. Espere um instante." },
      { status: 429 }
    );
  }

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
