"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Download, FileText, Plus, QrCode } from "lucide-react";
import { MetricCard } from "@/components/cartori/metric-card";
import { PixQr } from "@/components/storefront/pix-qr";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BulkActionBar,
  CategoryChips,
  ListToolbar,
  RowCheckbox,
  SelectAllCheckbox,
  useRowSelection,
} from "@/components/ui/data-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadCsv, formatCsvDate, toCsv } from "@/lib/csv";
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";
import { CANCEL_CATEGORY, ORDER_CATEGORIES, certificateOptions, inOrderCategory } from "@/lib/order-categories";
import {
  CANCEL_REQUESTED_META,
  PublicOrder,
  displayOrderStatus,
  displayStatusMeta,
  isOrderPaid,
  livePixCode,
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
  const router = useRouter();
  const [orders, setOrders] = React.useState<PublicOrder[]>([]);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [payId, setPayId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [certificateFilter, setCertificateFilter] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const selection = useRowSelection(orders);

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

  // Pagamento confirmado com o modal aberto: segue para a página de obrigado.
  const paidOrderId = isOrderPaid(payOrder) ? payOrder?.id : undefined;
  React.useEffect(() => {
    if (paidOrderId) router.push(`/pedido/${paidOrderId}/confirmado`);
  }, [paidOrderId, router]);

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

  const payIsPaid = isOrderPaid(payOrder);

  const display = (order: PublicOrder) => displayOrderStatus(order.status, order.payment?.status);
  const cancelRequested = (order: PublicOrder) => Boolean((order as PublicOrder & { cancelRequested?: boolean }).cancelRequested);
  const withNames = orders.map((order) => ({ ...order, certificates: order.items.map((item) => item.certificateName) }));
  // Na visão resumida (início do painel) não há filtros: mostra a lista inteira.
  const visible = compact
    ? withNames
    : withNames.filter((order) => {
        if (!inOrderCategory(category, display(order), cancelRequested(order))) return false;
        if (certificateFilter && !order.certificates.includes(certificateFilter)) return false;
        if (!inPeriod(order.createdAt, period)) return false;
        return matchesSearch(query, [order.protocol, ...order.certificates]);
      });

  const resetFilters = () => {
    setCategory("");
    setQuery("");
    setCertificateFilter("");
    setPeriod("");
  };

  const exportCsv = (rows: PublicOrder[]) =>
    downloadCsv(
      "meus-pedidos",
      toCsv(
        ["Protocolo", "Data", "Certidões", "Cidades", "Status", "Valor"],
        rows.map((order) => [
          order.protocol,
          formatCsvDate(order.createdAt),
          order.items.map((item) => item.certificateName).join(", "),
          Array.from(new Set(order.items.map((item) => `${item.city}/${item.state}`))).join(", "),
          displayStatusMeta(order.status, order.payment?.status).label,
          formatCurrency(order.totalAmount),
        ])
      )
    );

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
          <Link href="/painel/solicitar">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nova solicitação
            </Button>
          </Link>
        </div>
      ) : (
        <>
        {!compact && (
          <>
            <CategoryChips
              total={orders.length}
              value={category}
              onChange={setCategory}
              items={[
                ...ORDER_CATEGORIES.map((item) => ({
                  id: item.id,
                  label: item.label,
                  count: orders.filter((order) => item.statuses.includes(display(order))).length,
                })),
                ...(orders.some(cancelRequested)
                  ? [{ ...CANCEL_CATEGORY, count: orders.filter(cancelRequested).length }]
                  : []),
              ]}
            />
            <ListToolbar
              query={query}
              onQueryChange={setQuery}
              searchPlaceholder="Protocolo ou certidão"
              shown={visible.length}
              total={orders.length}
              onReset={resetFilters}
              actions={
                <Button variant="outline" size="md" onClick={() => exportCsv(visible)} disabled={!visible.length}>
                  <Download className="w-4 h-4" aria-hidden />
                  Exportar lista
                </Button>
              }
            >
              <Select
                aria-label="Certidão"
                value={certificateFilter}
                onChange={(e) => setCertificateFilter(e.target.value)}
                options={certificateOptions(withNames)}
              />
              <Select aria-label="Data do pedido" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
            </ListToolbar>
            <BulkActionBar count={selection.count} onClear={selection.clear}>
              <Button size="sm" variant="outline" onClick={() => exportCsv(selection.selectedRows)}>
                <Download className="w-4 h-4" aria-hidden />
                Exportar CSV
              </Button>
            </BulkActionBar>
          </>
        )}
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum pedido com esses filtros.</p>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {!compact && (
                <TableHead className="w-10">
                  <SelectAllCheckbox
                    checked={selection.allSelected(visible)}
                    onChange={() => selection.toggleAll(visible)}
                  />
                </TableHead>
              )}
              <TableHead>Protocolo</TableHead>
              <TableHead>Certidões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              {enablePayment && <TableHead className="text-right">Ação</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((order) => {
              const meta = cancelRequested(order)
                ? CANCEL_REQUESTED_META
                : displayStatusMeta(order.status, order.payment?.status);
              const names = order.items.map((item) => item.certificateName).join(", ");
              const isPending = order.status === "PENDING_PAYMENT";
              return (
                <TableRow key={order.id} isSelected={order.id === highlightId || selection.isSelected(order.id)}>
                  {!compact && (
                    <TableCell>
                      <RowCheckbox
                        label={`Selecionar pedido ${order.protocol}`}
                        checked={selection.isSelected(order.id)}
                        onChange={() => selection.toggle(order.id)}
                      />
                    </TableCell>
                  )}
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
        </>
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
