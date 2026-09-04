"use client";

import { Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AVAILABLE_NOW = [
  "Conta empresarial vinculada ao CNPJ",
  "Ambiente preparado para uso profissional",
  "Base para pedidos com contexto de empresa",
];

const PROGRESSIVE = [
  "Processos e dossiês",
  "Organização de demandas",
  "Equipe e colaboração",
  "Financeiro e visão operacional",
];

export function BusinessBenefitsDialog({
  isOpen,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader onClose={onClose}>
        <DialogTitle className="font-serif text-lg">O que a conta empresarial libera</DialogTitle>
        <DialogDescription className="text-sm text-neutral-600 max-w-xl">
          A conta empresarial expande sua experiência na Cartori: de uso pessoal para gestão
          profissional da sua operação.
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Disponível agora</h3>
            <ul className="mt-3 space-y-2">
              {AVAILABLE_NOW.map((item) => (
                <BenefitItem key={item} label={item} />
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Em liberação progressiva</h3>
            <ul className="mt-3 space-y-2">
              {PROGRESSIVE.map((item) => (
                <BenefitItem key={item} label={item} muted />
              ))}
            </ul>
          </section>
        </div>

        <p className="rounded-md border border-brand-200 bg-brand-50/60 p-3 text-[11px] text-brand-950 leading-relaxed">
          Importante: cadastrar empresa libera recursos B2B da sua conta, mas não ativa
          automaticamente o programa de parceiro/revendedor.
        </p>
      </DialogContent>

      <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button
          variant="primary"
          leftIcon={<Building2 className="w-3.5 h-3.5" />}
          onClick={onContinue}
        >
          Continuar com CNPJ
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function BenefitItem({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
      <Check
        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${muted ? "text-neutral-400" : "text-brand-700"}`}
        aria-hidden
      />
      <span>{label}</span>
    </li>
  );
}
