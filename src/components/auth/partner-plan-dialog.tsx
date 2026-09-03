"use client";

import * as React from "react";
import { Building2, Lock, Search } from "lucide-react";
import type { CnpjCompany } from "@/lib/cnpj";
import { digitsOnly, maskCpfCnpj } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";

export function PartnerPlanDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { refresh } = useAuth();
  const [cnpj, setCnpj] = React.useState("");
  const [company, setCompany] = React.useState<CnpjCompany | null>(null);
  const [oabNumber, setOabNumber] = React.useState("");
  const [creciNumber, setCreciNumber] = React.useState("");
  const [error, setError] = React.useState("");
  const [looking, setLooking] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setCnpj("");
      setCompany(null);
      setOabNumber("");
      setCreciNumber("");
      setError("");
    }
  }, [isOpen]);

  const lookup = async (value: string) => {
    const digits = digitsOnly(value);
    if (digits.length !== 14) {
      setCompany(null);
      return;
    }
    setLooking(true);
    setError("");
    try {
      const res = await fetch(`/api/cnpj/${digits}`);
      const data = await res.json();
      if (!data.success) {
        setCompany(null);
        setError(data.error || "CNPJ não encontrado.");
        return;
      }
      setCompany(data.company);
      if (!data.company.active) {
        setError(`Situação cadastral: ${data.company.status}. Só empresas ativas entram no plano.`);
      }
    } catch {
      setError("Não foi possível consultar o CNPJ.");
    } finally {
      setLooking(false);
    }
  };

  const submit = async () => {
    if (!company?.active) {
      setError("Consulte um CNPJ ativo para continuar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: company.cnpj,
          oabNumber,
          creciNumber,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Não foi possível cadastrar a empresa.");
        return;
      }
      await refresh();
      onSuccess?.();
      onClose();
    } catch {
      setError("Falha de conexão ao salvar a empresa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-950 text-neutral-0 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle>Cadastrar empresa</DialogTitle>
            <DialogDescription>
              Informe um CNPJ ativo na Receita Federal para liberar os recursos empresariais da conta.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <Input
          label="CNPJ"
          required
          value={cnpj}
          placeholder="00.000.000/0001-00"
          leftIcon={<Search className="w-4 h-4" />}
          helperText={looking ? "Consultando Receita Federal..." : "Os dados da empresa entram automaticamente."}
          onChange={(event) => {
            const next = maskCpfCnpj(event.target.value);
            setCnpj(next);
            setError("");
            if (digitsOnly(next).length === 14) lookup(next);
          }}
        />

        {company && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-1.5 text-xs">
            <p className="font-semibold text-neutral-900">{company.name}</p>
            {company.tradeName && (
              <p className="text-neutral-600">Nome fantasia: {company.tradeName}</p>
            )}
            <p className={company.active ? "text-emerald-700 font-medium" : "text-semantic-error font-medium"}>
              Situação: {company.status}
            </p>
            {company.legalNature && <p className="text-neutral-600">{company.legalNature}</p>}
            {(company.address || company.city) && (
              <p className="text-neutral-600">
                {[company.address, company.city, company.state].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="OAB (opcional)"
            value={oabNumber}
            onChange={(event) => setOabNumber(event.target.value)}
            placeholder="OAB/SP 000000"
          />
          <Input
            label="CRECI (opcional)"
            value={creciNumber}
            onChange={(event) => setCreciNumber(event.target.value)}
            placeholder="CRECI 00000"
          />
        </div>

        <div className="rounded-md border border-brand-200 bg-brand-50/60 p-3 text-[11px] text-brand-950 leading-relaxed">
          Cadastrar a empresa libera os recursos B2B (organização, equipe, dossiês e financeiro). Isso não habilita o programa comercial de parceiro/revendedor.
        </div>

        {error && <Alert variant="error" title="Não foi possível continuar">{error}</Alert>}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Agora não
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          isLoading={saving}
          disabled={!company?.active}
          leftIcon={<Lock className="w-3.5 h-3.5" />}
        >
          Cadastrar empresa
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
