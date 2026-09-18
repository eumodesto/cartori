"use client";

import * as React from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderStatusMeta } from "@/lib/order-status";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

type OpsOrder = {
  id: string;
  protocol: string;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  certificates: string[];
};

function isStaffRole(role: string | undefined) {
  return role === "ADMIN" || role === "OPERATOR";
}

export default function OperacaoPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = React.useState<OpsOrder[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!loading && profile && !isStaffRole(profile.role)) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  React.useEffect(() => {
    if (!profile || !isStaffRole(profile.role)) return;
    fetch("/api/ops/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar a fila.");
          return;
        }
        setOrders(data.orders || []);
      })
      .catch(() => setError("Falha ao carregar a fila operacional."));
  }, [profile]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando mesa operacional...</p>;
  }
  if (!isStaffRole(profile.role)) return null;

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Mesa operacional"
        description="Pedidos de todos os clientes. Atualize o status, envie mensagem e peça documentos. O cliente recebe e-mail para voltar ao painel."
      />
      {error && <Alert variant="error">{error}</Alert>}
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pedido na fila.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Certidões</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const meta = orderStatusMeta(order.status);
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/operacao/${order.id}`}
                      className="font-mono text-xs text-brand-800 hover:underline"
                    >
                      {order.protocol}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{order.customerName}</p>
                    <p className="text-[11px] text-neutral-500">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell>{order.certificates.join(", ")}</TableCell>
                  <TableCell>
                    <StatusBadge status={meta.semantic} label={meta.label} size="sm" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
