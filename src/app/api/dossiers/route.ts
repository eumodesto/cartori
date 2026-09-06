import { NextRequest, NextResponse } from "next/server";
import { DossierPurpose } from "@prisma/client";
import { orderOwnerFromContext, requireAuth } from "@/lib/authorization";
import { parseSubjectsInput } from "@/lib/dossier-parse";
import { createDossier, listDossiersByUser } from "@/lib/dossier-store";

const PURPOSES: DossierPurpose[] = [
  "COMPRA_IMOVEL",
  "FINANCIAMENTO",
  "INVENTARIO",
  "DUE_DILIGENCE_SOCIETARIA",
  "PROCESSO",
  "OUTRO",
];

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return NextResponse.json(
        { success: false, error: "Entre na conta para ver seus dossiês." },
        { status: 401 }
      );
    }
    return auth.response;
  }

  const dossiers = await listDossiersByUser(auth.context.userId);
  return NextResponse.json({ success: true, dossiers });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      if (auth.response.status === 401) {
        return NextResponse.json(
          { success: false, error: "Entre na conta para criar um dossiê." },
          { status: 401 }
        );
      }
      return auth.response;
    }

    const body = await req.json();
    const purpose = body.purpose as DossierPurpose;
    if (!PURPOSES.includes(purpose)) {
      return NextResponse.json(
        { success: false, error: "Informe a finalidade da análise." },
        { status: 400 }
      );
    }

    const purposeNote =
      purpose === "OUTRO" ? String(body.purposeNote || "").trim() : null;
    if (purpose === "OUTRO" && !purposeNote) {
      return NextResponse.json(
        { success: false, error: "Descreva a finalidade da análise." },
        { status: 400 }
      );
    }

    const subjects = parseSubjectsInput(body.subjects);
    if (typeof subjects === "string") {
      return NextResponse.json({ success: false, error: subjects }, { status: 400 });
    }

    const owner = orderOwnerFromContext(auth.context);
    const dossier = await createDossier({
      userId: owner.userId,
      organizationId: owner.organizationId,
      title: typeof body.title === "string" ? body.title : "",
      purpose,
      purposeNote,
      subjects,
    });

    return NextResponse.json({ success: true, dossier }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o dossiê.";
    console.error("Erro POST /api/dossiers:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
