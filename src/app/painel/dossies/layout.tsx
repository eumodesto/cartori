"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PartnerGate } from "@/components/dashboard/partner-gate";

/** Dossiês ainda em construção: liberado só para empresa cadastrada (e administrador). */
export default function DossiesLayout({ children }: { children: React.ReactNode }) {
  const { hasBusinessFeatures, loading } = useAuth();
  if (loading) return <p className="text-sm text-neutral-500">Carregando...</p>;
  if (!hasBusinessFeatures) return <PartnerGate title="Dossiês & Processos" />;
  return <>{children}</>;
}
