import { NextRequest, NextResponse } from "next/server";
import { requireDossierAccess } from "@/lib/dossier-access";
import { recommendCertificates } from "@/lib/dossier-recommend";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireDossierAccess(params.id);
  if (!access.ok) return access.response;
  const recommendations = await recommendCertificates(access.dossier);
  return NextResponse.json({
    success: true,
    dossier: access.dossier,
    recommendations,
  });
}
