import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import {
  getManagedUser,
  isManageableRole,
  requireUserManagement,
  updateManagedUser,
} from "@/lib/admin-users";
import { digitsOnly } from "@/lib/utils";
import { isValidPhone } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const user = await getManagedUser(params.id);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Usuário não encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, user });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireUserManagement();
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => ({}));
  const patch: { name?: string; phone?: string; role?: UserRole } = {};

  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Informe o nome completo." },
        { status: 400 }
      );
    }
    patch.name = name;
  }

  if (body.phone !== undefined) {
    const phone = String(body.phone || "");
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Telefone inválido." },
        { status: 400 }
      );
    }
    patch.phone = phone ? digitsOnly(phone) : "";
  }

  if (body.role !== undefined) {
    if (!isManageableRole(body.role)) {
      return NextResponse.json(
        { success: false, error: "Papel inválido." },
        { status: 400 }
      );
    }
    // Trava anti-lockout: um admin não remove o próprio acesso de administrador.
    if (params.id === gate.context.userId && body.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Você não pode remover o próprio acesso de administrador. Peça a outro administrador.",
        },
        { status: 400 }
      );
    }
    patch.role = body.role;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { success: false, error: "Nada para atualizar." },
      { status: 400 }
    );
  }

  const updated = await updateManagedUser({ id: params.id, ...patch });
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Usuário não encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, user: updated });
}
