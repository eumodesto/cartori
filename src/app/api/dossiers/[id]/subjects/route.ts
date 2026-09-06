import { NextRequest, NextResponse } from "next/server";
import { requireDossierAccess } from "@/lib/dossier-access";
import { parseSubjectInput } from "@/lib/dossier-parse";
import { addSubjectToOwnedDossier } from "@/lib/dossier-store";
import { recommendCertificates } from "@/lib/dossier-recommend";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await requireDossierAccess(params.id);
    if (!access.ok) return access.response;

    const body = await req.json();
    const subject = parseSubjectInput(body);
    if (typeof subject === "string") {
      return NextResponse.json({ success: false, error: subject }, { status: 400 });
    }

    const dossier = await addSubjectToOwnedDossier({
      dossierId: params.id,
      userId: access.context.userId,
      subject,
    });
    if (!dossier) {
      return NextResponse.json(
        { success: false, error: "Dossiê não encontrado." },
        { status: 404 }
      );
    }

    const recommendations = await recommendCertificates(dossier);
    return NextResponse.json({ success: true, dossier, recommendations }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Não foi possível incluir o sujeito.";
    console.error("Erro POST /api/dossiers/[id]/subjects:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
