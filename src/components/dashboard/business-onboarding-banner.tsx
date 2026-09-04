"use client";

import * as React from "react";
import { Building2, FolderOpen, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHIPS = [
  { label: "Centralize pedidos", icon: Layers },
  { label: "Organize por cliente ou processo", icon: FolderOpen },
  { label: "Prepare sua operação para recursos B2B", icon: Building2 },
] as const;

export function BusinessOnboardingBanner({
  eligible,
  onRegister,
  onViewBenefits,
}: {
  eligible: boolean;
  onRegister: () => void;
  onViewBenefits: () => void;
}) {
  const [dismissed, setDismissed] = React.useState(false);

  if (!eligible || dismissed) return null;

  return (
    <aside
      aria-label="Conta empresarial Cartori"
      className="relative w-full rounded-xl border border-brand-200 bg-brand-50/70 p-4 sm:p-5 pr-11 sm:pr-12"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Fechar aviso de conta empresarial"
        className="absolute top-3 right-3 p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-0/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <X className="w-4 h-4" />
      </button>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
        Mais controle. Mais eficiência. Mais crescimento.
      </p>
      <h2 className="mt-1.5 text-lg sm:text-xl font-serif font-bold text-neutral-900 leading-snug">
        Desbloqueie a conta empresarial da Cartori
      </h2>
      <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed max-w-3xl">
        Cadastre o CNPJ da sua empresa para centralizar solicitações, organizar demandas e
        liberar recursos empresariais voltados a advocacias, imobiliárias e operações recorrentes.
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <li
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-neutral-0 px-2.5 py-1 text-[11px] font-medium text-brand-950"
          >
            <chip.icon className="w-3.5 h-3.5 text-brand-700 shrink-0" aria-hidden />
            {chip.label}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Building2 className="w-3.5 h-3.5" />}
          onClick={onRegister}
        >
          Cadastrar CNPJ
        </Button>
        <Button variant="outline" size="sm" onClick={onViewBenefits}>
          Ver benefícios
        </Button>
      </div>

      <p className="mt-2.5 text-[11px] text-neutral-500 leading-relaxed">
        Cadastrar empresa não ativa o programa de parceiro/revendedor.
      </p>
    </aside>
  );
}
