"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, FileText, Plus, QrCode } from "lucide-react";
import { MetricCard } from "@/components/cartori/metric-card";
import { PixQr } from "@/components/storefront/pix-qr";
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
  enablePayment = false,
}: {
  highlightId?: string | null;
  compact?: boolean;
  /** Habilita o botão "Prosseguir com pagamento" + modal de QR (apenas em Pedidos). */
  enablePayment?: boolean;
}) {
  const searchParams = useSearchParams();
  const [orders, setOrders] = React.useState<PublicOrder[]>([]);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [payId, setPayId] = React.useState<string | null>(null);

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

  // Atualiza um pedido em destaque (pós-checkout) periodicamente.
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

  // Abre o modal de pagamento automaticamente após o checkout (?pay=<id>).
  React.useEffect(() => {
    if (!enablePayment) return;
    const pay = searchParams?.get("pay");
    if (pay) setPayId(pay);
  }, [enablePayment, searchParams]);

  const payOrder = payId ? orders.find((o) => o.id === payId) || null : null;

  // Enquanto o modal está aberto, acompanha o pagamento do pedido.
  React.useEffect(() => {
    if (!payId) return;
    const tick = () => {
      fetch(`/api/orders/${payId}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.order) return;
          setOrders((prev) => {
            const rest = prev.filter((o) => o.id !== data.order.id);
            return [data.order, ...rest];
          });
        })
        .catch(() => undefined);
    };
    const timer = window.setInterval(tick, 4000);
    return () => window.clearInterval(timer);
  }, [payId]);

  const payPixCode = livePixCode(payOrder?.payment?.qrCode);

  const paidCount = orders.filter(
    (order) => order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED"
  ).length;
  const pendingCount = orders.filter((order) => order.status === "PENDING_PAYMENT").length;

  const copyPix = async () => {
    if (!payPixCode) return;
    await navigator.clipboard.writeText(payPixCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const closePay = () => {
    setPayId(null);
    setCopied(false);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando seus pedidos...</p>;
  }

  const payIsPaid = payOrder && payOrder.status !== "PENDING_PAYMENT";

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
              {enablePayment && <TableHead className="text-right">Ação</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const meta = orderStatusMeta(order.status);
              const names = order.items.map((item) => item.certificateName).join(", ");
              const isPending = order.status === "PENDING_PAYMENT";
              return (
                <TableRow key={order.id} isSelected={order.id === highlightId}>
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/painel/pedidos/${order.id}`}
                      className="text-brand-800 hover:underline"
                    >
                      {order.protocol}
                    </Link>
                  </TableCell>
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
                  {enablePayment && (
                    <TableCell className="text-right">
                      {isPending ? (
                        <Button
                          size="sm"
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                          onClick={() => setPayId(order.id)}
                        >
                          Prosseguir com pagamento
                        </Button>
                      ) : (
                        <span className="text-[11px] text-neutral-400">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Modal de pagamento (QR + detalhes) — apenas em Pedidos */}
      <Dialog isOpen={enablePayment && Boolean(payId)} onClose={closePay} size="lg">
        <DialogHeader onClose={closePay}>
          <DialogTitle>
            {payIsPaid ? "Pagamento confirmado" : "Pagamento do pedido"}
            {payOrder ? ` · ${payOrder.protocol}` : ""}
          </DialogTitle>
          <DialogDescription>
            {payOrder
              ? `${formatCurrency(payOrder.totalAmount)} · ${
                  payIsPaid
                    ? "Recebemos o pagamento."
                    : "Pague por PIX — o status atualiza sozinho quando cair."
                }`
              : "Carregando pedido..."}
          </DialogDescription>
        </DialogHeader>

        <DialogContent>
          {!payOrder ? (
            <p className="text-sm text-neutral-500">Carregando dados do pedido...</p>
          ) : payIsPaid ? (
            <Alert variant="success" title="Tudo certo!">
              O pedido {payOrder.protocol} foi pago. Acompanhe o andamento na lista.
            </Alert>
          ) : (
            <div className="space-y-5">
              {/* Detalhes do pedido */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Itens do pedido
                </p>
                <ul className="space-y-1.5">
                  {payOrder.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-neutral-800">
                        {item.certificateName}
                        <span className="text-neutral-500"> · {item.city}/{item.state}</span>
                      </span>
                      <span className="text-neutral-600 shrink-0">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-sm font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCurrency(payOrder.totalAmount)}</span>
                </div>
              </div>

              {/* QR + código */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <PixQr
                  qrCode={payPixCode}
                  qrCodeBase64={payOrder.payment?.qrCodeBase64}
                />
                <div className="space-y-3 flex-1 w-full">
                  {payPixCode ? (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      leftIcon={<Copy className="w-4 h-4" />}
                      onClick={copyPix}
                    >
                      {copied ? "Código copiado" : "Copiar código PIX"}
                    </Button>
                  ) : (
                    <p className="text-sm text-neutral-500">Gerando QR Code do PIX...</p>
                  )}
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Escaneie o QR Code no app do seu banco ou use o código copia‑e‑cola.
                    Assim que o pagamento for confirmado, o pedido avança automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          {payOrder && !payIsPaid && (
            <Link href={`/pedido/${payOrder.id}`}>
              <Button variant="ghost">Abrir página do pagamento</Button>
            </Link>
          )}
          <Button variant={payIsPaid ? "primary" : "outline"} onClick={closePay}>
            {payIsPaid ? "Concluir" : "Fechar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
