import { NextResponse } from "next/server";
import {
  type AuthContext,
  logAuthzDeny,
  privateNotFoundResponse,
  requireAuth,
  unauthorizedResponse,
} from "@/lib/authorization";
import { getOwnedDossier } from "@/lib/dossier-store";
import type { PublicDossier } from "@/lib/dossier-types";

export function dossierUnauthorizedResponse() {
  return unauthorizedResponse("Entre na conta para ver este dossiê.");
}

export function dossierNotFoundResponse() {
  return privateNotFoundResponse("Dossiê não encontrado.");
}

export async function requireDossierAccess(dossierId: string): Promise<
  | { ok: true; context: AuthContext; dossier: PublicDossier }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return { ok: false, response: dossierUnauthorizedResponse() };
    }
    return auth;
  }

  const dossier = await getOwnedDossier(dossierId, auth.context.userId);
  if (!dossier) {
    logAuthzDeny({
      userId: auth.context.userId,
      role: auth.context.role,
      resourceType: "dossier",
      resourceId: dossierId,
      reason: "dossier_not_owned",
    });
    return { ok: false, response: dossierNotFoundResponse() };
  }

  return { ok: true, context: auth.context, dossier };
}
