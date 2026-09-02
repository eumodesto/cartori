"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, FileText, Plus } from "lucide-react";
import { MetricCard } from "@/components/cartori/metric-card";
import { PixQr } from "@/components/storefront/pix-qr";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PublicOrder,
  livePixCode,
  orderStatusMeta,
} from "@/lib/order-status";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MyOrders({
  highlightId,
  compact = false,
}: {
  highlightId?: string | null;
  compact?: boolean;
}) {
  const [orders, setOrders] = React.useState<PublicOrder[]>([]);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/orders", { cache: "no-store" });
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Não foi possível carregar os pedidos.");
      return;
    }
    setOrders(data.orders || []);
    setError("");
  }, []);

  React.useEffect(() => {
    load()
      .catch(() => setError("Falha ao carregar os pedidos."))
      .finally(() => setLoading(false));
  }, [load]);

  React.useEffect(() => {
    if (!highlightId) return;
    const timer = window.setInterval(() => {
      fetch(`/api/orders/${highlightId}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.order) return;
          setOrders((prev) => {
            const next = prev.filter((order) => order.id !== data.order.id);
            return [data.order, ...next];
          });
        })
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [highlightId]);

  const highlighted =
    orders.find((order) => order.id === highlightId) ||
    orders.find((order) => order.status === "PENDING_PAYMENT") ||
    null;
  const pixCode = livePixCode(highlighted?.payment?.qrCode);
  const awaitingPix =
    highlighted?.status === "PENDING_PAYMENT" &&
    highlighted.payment?.method !== "CREDIT_CARD";

  const paidCount = orders.filter((order) => order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED").length;
  const pendingCount = orders.filter((order) => order.status === "PENDING_PAYMENT").length;

  const copyPix = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando seus pedidos...</p>;
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Pedidos" value={orders.length} icon={<FileText className="w-4 h-4" />} />
          <MetricCard
            title="Em andamento"
            value={paidCount}
            variant="info"
            subtitle="Pagos ou em emissão"
          />
          <MetricCard
            title="Aguardando pagamento"
            value={pendingCount}
            variant={pendingCount ? "warning" : "default"}
          />
        </div>
      )}

      {awaitingPix && highlighted && (
        <div className="rounded-2xl border border-brand-200 bg-neutral-0 p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
              Pagamento PIX
            </p>
            <h2 className="text-lg font-serif font-bold text-neutral-900">
              Pedido {highlighted.protocol}
            </h2>
            <p className="text-sm text-neutral-600">
              {formatCurrency(highlighted.totalAmount)} · o QR Code atualiza sozinho quando o pagamento cair.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <PixQr qrCode={pixCode} qrCodeBase64={highlighted.payment?.qrCodeBase64} />
            <div className="space-y-3 flex-1">
              {pixCode ? (
                <Button variant="outline" leftIcon={<Copy className="w-4 h-4" />} onClick={copyPix}>
                  {copied ? "Código copiado" : "Copiar código PIX"}
                </Button>
              ) : (
                <p className="text-sm text-neutral-500">Gerando QR Code...</p>
              )}
              <Link href={`/pedido/${highlighted.id}`}>
                <Button variant="ghost">Abrir página do pagamento</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && <Alert variant="error" title="Pedidos">{error}</Alert>}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-8 text-center space-y-3">
          <h2 className="text-lg font-serif font-bold text-neutral-900">Nenhuma solicitação ainda</h2>
          <p className="text-sm text-neutral-600">
            Depois do checkout, seus pedidos e downloads aparecem aqui.
          </p>
          <Link href="/#certidoes">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nova solicitação
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Certidões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const meta = orderStatusMeta(order.status);
              const names = order.items.map((item) => item.certificateName).join(", ");
              return (
                <TableRow
                  key={order.id}
                  isSelected={order.id === highlightId}
                >
                  <TableCell className="font-mono text-xs">{order.protocol}</TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{names}</p>
                    <p className="text-[11px] text-neutral-500">
                      {order.items
                        .map((item) => `${item.city}/${item.state}`)
                        .filter((value, index, list) => list.indexOf(value) === index)
                        .join(" · ")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={meta.semantic} label={meta.label} size="sm" />
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell className="text-neutral-500">{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
