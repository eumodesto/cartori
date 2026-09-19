"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { OrderCasePanel } from "@/components/dashboard/order-case-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function SolicitacaoDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Acompanhamento"
        description="Mensagens da Cartori, status da certidão e envio de RG, CNH, certidões e comprovantes."
        actions={
          <Link href="/painel/pedidos">
            <Button variant="outline">Todas as solicitações</Button>
          </Link>
        }
      />
      {params.id ? <OrderCasePanel orderId={params.id} /> : null}
    </div>
  );
}
