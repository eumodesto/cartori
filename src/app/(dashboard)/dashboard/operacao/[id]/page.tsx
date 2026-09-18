"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { OrderCasePanel } from "@/components/dashboard/order-case-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

function isStaffRole(role: string | undefined) {
  return role === "ADMIN" || role === "OPERATOR";
}

export default function OperacaoDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && profile && !isStaffRole(profile.role)) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }
  if (!isStaffRole(profile.role)) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Pedido na mesa"
        description="Status, mensagem e arquivos. Atualizar avisa o cliente por e-mail."
        actions={
          <Link href="/dashboard/operacao">
            <Button variant="outline">Fila</Button>
          </Link>
        }
      />
      {params.id ? <OrderCasePanel orderId={params.id} staff /> : null}
    </div>
  );
}
