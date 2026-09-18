import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorization";
import { getAuthProfile } from "@/lib/auth";
import {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  uploadAvatar,
} from "@/lib/avatar-storage";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para enviar a foto." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Envio inválido." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { success: false, error: "Selecione uma imagem." },
      { status: 400 }
    );
  }
  if (!AVATAR_CONTENT_TYPES[file.type]) {
    return NextResponse.json(
      { success: false, error: "Formato inválido. Use PNG, JPG ou WEBP." },
      { status: 400 }
    );
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: "A imagem pode ter no máximo 2 MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const avatarUrl = await uploadAvatar(auth.context.userId, buffer, file.type);
    await prisma.user.update({
      where: { id: auth.context.userId },
      data: { avatarUrl },
    });
    const profile = await getAuthProfile();
    return NextResponse.json({ success: true, avatarUrl, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao enviar a foto.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
