"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PartnerGate } from "@/components/dashboard/partner-gate";

/** Consulta de cartórios: recurso B2B (empresa cadastrada e administrador). */
export default function CartoriosLayout({ children }: { children: React.ReactNode }) {
  const { hasBusinessFeatures, loading } = useAuth();
  if (loading) return <p className="text-sm text-neutral-500">Carregando...</p>;
  if (!hasBusinessFeatures) return <PartnerGate title="Consulta de cartórios" />;
  return <>{children}</>;
}
