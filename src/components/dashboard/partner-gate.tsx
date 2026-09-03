"use client";

import * as React from "react";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Building2, Lock } from "lucide-react";

export function PartnerGate({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const { isBusiness, loading } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isBusiness) setOpen(true);
  }, [isBusiness, loading]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }

  if (isBusiness) {
    return (
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">{title}</h1>
        {children || (
          <p className="text-sm text-neutral-600">
            Módulo empresarial liberado. A operação completa entra em uma próxima etapa.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-4">
      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-950 flex items-center justify-center">
        <Lock className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-serif font-bold text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Disponível após cadastrar a empresa com CNPJ verificado na Receita Federal.
        </p>
      </div>
      <Button variant="primary" leftIcon={<Building2 className="w-4 h-4" />} onClick={() => setOpen(true)}>
        Cadastrar empresa
      </Button>
      <PartnerPlanDialog isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
