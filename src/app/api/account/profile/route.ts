import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorization";
import { getAuthProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { digitsOnly } from "@/lib/utils";
import { isValidPhone } from "@/lib/validators";

/**
 * Perfil próprio (self-service). Qualquer usuário autenticado edita apenas
 * o PRÓPRIO registro (context.userId). role/email/cpf/userId NUNCA vêm do body:
 * papel é decisão de plataforma; e-mail é identidade (Supabase).
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para editar o perfil." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const body = await req.json().catch(() => ({}));
  const data: { name?: string; phone?: string } = {};

  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Informe o nome completo." },
        { status: 400 }
      );
    }
    data.name = name;
  }

  if (body.phone !== undefined) {
    const phone = String(body.phone || "");
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Telefone inválido." },
        { status: 400 }
      );
    }
    data.phone = digitsOnly(phone);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { success: false, error: "Nada para atualizar." },
      { status: 400 }
    );
  }

  await prisma.user.update({ where: { id: auth.context.userId }, data });
  const profile = await getAuthProfile();
  return NextResponse.json({ success: true, profile });
}
