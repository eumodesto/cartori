import { NextRequest, NextResponse } from "next/server";
import { lookupCnpj } from "@/lib/cnpj";
import { isValidCnpj } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { cnpj: string } }
) {
  try {
    if (!isValidCnpj(params.cnpj)) {
      return NextResponse.json(
        { success: false, error: "Informe um CNPJ válido." },
        { status: 400 }
      );
    }
    const company = await lookupCnpj(params.cnpj);
    if (!company) {
      return NextResponse.json(
        { success: false, error: "CNPJ não encontrado na Receita Federal." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, company });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao consultar o CNPJ.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
