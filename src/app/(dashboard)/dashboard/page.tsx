"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { BusinessBenefitsDialog } from "@/components/dashboard/business-benefits-dialog";
import { BusinessOnboardingBanner } from "@/components/dashboard/business-onboarding-banner";
import { MyOrders } from "@/components/dashboard/my-orders";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

function DashboardHome() {
  const { profile, isBusiness, loading } = useAuth();
  const searchParams = useSearchParams();
  const [partnerOpen, setPartnerOpen] = React.useState(false);
  const [benefitsOpen, setBenefitsOpen] = React.useState(false);
  const highlightId = searchParams.get("pedido");
  const firstName = profile?.name?.split(" ")[0] || "olá";
  const showBusinessBanner = Boolean(profile) && !loading && !isBusiness;

  const openCnpjFlow = React.useCallback(() => {
    setBenefitsOpen(false);
    setPartnerOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Painel, ${firstName}`}
        description={
          isBusiness
            ? "Pedidos da conta e contexto da empresa cadastrada."
            : "Acesso pessoal: pedidos e novas solicitações. Recursos empresariais liberam ao cadastrar o CNPJ da empresa."
        }
        actions={
          <Link href="/#certidoes">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nova solicitação
            </Button>
          </Link>
        }
      />

      <BusinessOnboardingBanner
        eligible={showBusinessBanner}
        onRegister={openCnpjFlow}
        onViewBenefits={() => setBenefitsOpen(true)}
      />

      <MyOrders highlightId={highlightId} />
      <BusinessBenefitsDialog
        isOpen={benefitsOpen}
        onClose={() => setBenefitsOpen(false)}
        onContinue={openCnpjFlow}
      />
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
