"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { MyOrders } from "@/components/dashboard/my-orders";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

function DashboardHome() {
  const { profile, isPartner } = useAuth();
  const searchParams = useSearchParams();
  const [partnerOpen, setPartnerOpen] = React.useState(false);
  const highlightId = searchParams.get("pedido");
  const firstName = profile?.name?.split(" ")[0] || "olá";

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={`Painel, ${firstName}`}
        description={
          isPartner
            ? "Pedidos da conta e da empresa parceira, com CNPJ verificado."
            : "Acesso padrão: pedidos, downloads e novas solicitações. Equipe, dossiês, financeiro e cartórios liberam no plano empresa parceira."
        }
        actions={
          <Link href="/#certidoes">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nova solicitação
            </Button>
          </Link>
        }
      />

      {!isPartner && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-950">Virar empresa parceira</p>
            <p className="text-xs text-neutral-600 mt-0.5">
              Cadastre um CNPJ ativo e os dados da Receita entram automaticamente. Liberamos equipe, dossiês, financeiro e operação.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Building2 className="w-4 h-4" />}
            onClick={() => setPartnerOpen(true)}
          >
            Cadastrar CNPJ
          </Button>
        </div>
      )}

      <MyOrders highlightId={highlightId} />
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<p className="text-sm text-neutral-500">Carregando painel...</p>}>
      <DashboardHome />
    </React.Suspense>
  );
}
