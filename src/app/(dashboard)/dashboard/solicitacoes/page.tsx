"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { MyOrders } from "@/components/dashboard/my-orders";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function SolicitacoesPage() {
  return (
    <div className="max-w-6xl space-y-6">
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
      <MyOrders />
    </div>
  );
}
