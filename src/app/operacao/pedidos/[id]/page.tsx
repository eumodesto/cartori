"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { OrderCasePanel } from "@/components/dashboard/order-case-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function OperacaoDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedido na mesa"
        description="Status, mensagem e arquivos. Atualizar avisa o cliente por e-mail."
        actions={
          <Link href="/operacao/pedidos">
            <Button variant="outline">Fila</Button>
          </Link>
        }
      />
      {params.id ? <OrderCasePanel orderId={params.id} staff /> : null}
    </div>
  );
}
