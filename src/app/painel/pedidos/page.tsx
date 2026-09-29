"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MyOrders } from "@/components/dashboard/my-orders";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function SolicitacoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitações"
        description="Pedidos da sua conta. Depois do pagamento, o andamento e os downloads ficam aqui."
        actions={
          <Link href="/#certidoes">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nova solicitação
            </Button>
          </Link>
        }
      />
      <React.Suspense
        fallback={<p className="text-sm text-neutral-500">Carregando pedidos...</p>}
      >
        <MyOrders enablePayment />
      </React.Suspense>
    </div>
  );
}
