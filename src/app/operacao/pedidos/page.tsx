"use client";

import * as React from "react";
import Link from "next/link";
import { Download, RefreshCw, Trash2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadCsv } from "@/lib/csv";
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";
import { BULK_ORDER_LIMIT, DELETE_CONFIRM_WORD, ordersToCsv } from "@/lib/order-bulk";
import { ORDER_CATEGORIES, certificateOptions, inOrderCategory } from "@/lib/order-categories";
import {
  DISPLAY_STATUS_META,
  STAFF_STATUS_OPTIONS,
  displayOrderStatus,
  displayStatusMeta,
  orderStepLabel,
} from "@/lib/order-status";

type OpsOrder = {
  id: string;
  protocol: string;
  status: string;
  paymentStatus: string | null;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  certificates: string[];
  allowedStatuses: string[];
  deletable: boolean;
};

type BulkSkip = { id: string; protocol: string | null; reason: string };
type Notice = { variant: "success" | "warning" | "error"; text: string; skipped?: BulkSkip[] };

const STATUS_FILTERS = [
  { value: "", label: "Todos os status" },
  ...Object.entries(DISPLAY_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
];

export default function OperacaoPage() {
  const [orders, setOrders] = React.useState<OpsOrder[]>([]);
  const [canDelete, setCanDelete] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [category, setCategory] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [certificateFilter, setCertificateFilter] = React.useState("");
  const [period, setPeriod] = React.useState("");

  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [dialog, setDialog] = React.useState<"status" | "delete" | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [targetStatus, setTargetStatus] = React.useState("");
  const [note, setNote] = React.useState("");
  const [confirmWord, setConfirmWord] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    return fetch("/api/ops/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar a fila.");
          return;
        }
        setError("");
        setOrders(data.orders || []);
        setCanDelete(Boolean(data.canDelete));
      })
      .catch(() => setError("Falha ao carregar a fila operacional."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const selection = useRowSelection(orders);
  const display = (order: OpsOrder) => displayOrderStatus(order.status, order.paymentStatus);

  const visible = orders.filter((order) => {
    if (!inOrderCategory(category, display(order))) return false;
    if (statusFilter && display(order) !== statusFilter) return false;
    if (certificateFilter && !order.certificates.includes(certificateFilter)) return false;
    if (!inPeriod(order.createdAt, period)) return false;
    return matchesSearch(query, [order.protocol, order.customerName, order.customerEmail, ...order.certificates]);
  });

  const resetFilters = () => {
    setCategory("");
    setQuery("");
    setStatusFilter("");
    setCertificateFilter("");
    setPeriod("");
  };

  const selectedOrders = selection.selectedRows;
  const statusEligible = targetStatus
    ? selectedOrders.filter((order) => order.allowedStatuses.includes(targetStatus))
    : [];
  const deleteEligible = selectedOrders.filter((order) => order.deletable);

  function exportCsv(rows: OpsOrder[]) {
    downloadCsv(
      "pedidos",
      ordersToCsv(
        rows.map((order) => ({ ...order, statusLabel: displayStatusMeta(order.status, order.paymentStatus).label }))
      )
    );
  }

  function closeDialog() {
    if (busy) return;
    setDialog(null);
    setTargetStatus("");
    setNote("");
    setConfirmWord("");
  }

  async function runBulk(payload: Record<string, unknown>, ids: string[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/ops/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, orderIds: ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setNotice({ variant: "error", text: data.error || "Não foi possível aplicar a ação." });
        return;
      }
      const done: number = payload.action === "delete" ? data.deleted.length : data.updated.length;
      const skipped: BulkSkip[] = data.skipped || [];
      const verb = payload.action === "delete" ? "excluído(s)" : "atualizado(s)";
      setNotice({
        variant: skipped.length ? "warning" : "success",
        text: `${done} pedido(s) ${verb}.${skipped.length ? ` ${skipped.length} ficaram de fora:` : ""}`,
        skipped,
      });
      selection.clear();
      setDialog(null);
      setTargetStatus("");
      setNote("");
      setConfirmWord("");
      await load();
    } catch {
      setNotice({ variant: "error", text: "Falha de conexão. Nada foi confirmado; recarregue a lista." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Pedidos de todos os clientes. Atualize o status, envie mensagem e peça documentos. O cliente recebe e-mail para voltar ao painel."
      />
      {error && <Alert variant="error">{error}</Alert>}
      {notice && (
        <Alert variant={notice.variant}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p>{notice.text}</p>
              {notice.skipped && notice.skipped.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {notice.skipped.map((skip) => (
                    <li key={skip.id}>
                      <span className="font-mono">{skip.protocol ?? skip.id.slice(0, 8)}</span>: {skip.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso">
              <X className="w-4 h-4" />
            </button>
          </div>
        </Alert>
      )}

      <CategoryChips
        total={orders.length}
        value={category}
        onChange={setCategory}
        items={ORDER_CATEGORIES.map((item) => ({
          id: item.id,
          label: item.label,
          count: orders.filter((order) => item.statuses.includes(display(order))).length,
        }))}
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Protocolo, cliente, e-mail ou certidão"
        shown={visible.length}
        total={orders.length}
        onReset={resetFilters}
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => exportCsv(visible)} disabled={!visible.length}>
              <Download className="w-4 h-4" aria-hidden />
              Exportar lista
            </Button>
            <Button variant="ghost" size="md" onClick={() => load()} disabled={loading} aria-label="Atualizar">
              <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} aria-hidden />
            </Button>
          </>
        }
      >
        <Select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_FILTERS} />
        <Select
          aria-label="Certidão"
          value={certificateFilter}
          onChange={(e) => setCertificateFilter(e.target.value)}
          options={certificateOptions(orders)}
        />
        <Select aria-label="Data do pedido" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
      </ListToolbar>

      <BulkActionBar
        count={selection.count}
        onClear={selection.clear}
        note={
          selection.count > BULK_ORDER_LIMIT ? (
            <span className="text-semantic-error">Ações em massa aceitam até {BULK_ORDER_LIMIT} pedidos por vez.</span>
          ) : null
        }
      >
        <Button size="sm" onClick={() => setDialog("status")} disabled={selection.count > BULK_ORDER_LIMIT}>
          Alterar status
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportCsv(selectedOrders)}>
          <Download className="w-4 h-4" aria-hidden />
          Exportar CSV
        </Button>
        {canDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDialog("delete")}
            disabled={selection.count > BULK_ORDER_LIMIT}
          >
            <Trash2 className="w-4 h-4" aria-hidden />
            Excluir
          </Button>
        )}
      </BulkActionBar>

      {loading && orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {orders.length === 0 ? "Nenhum pedido na fila." : "Nenhum pedido com esses filtros."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectAllCheckbox
                  checked={selection.allSelected(visible)}
                  onChange={() => selection.toggleAll(visible)}
                />
              </TableHead>
              <TableHead>Protocolo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Certidões</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((order) => {
              const meta = displayStatusMeta(order.status, order.paymentStatus);
              const step = orderStepLabel(order.status);
              return (
                <TableRow key={order.id} isSelected={selection.isSelected(order.id)}>
                  <TableCell>
                    <RowCheckbox
                      label={`Selecionar pedido ${order.protocol}`}
                      checked={selection.isSelected(order.id)}
                      onChange={() => selection.toggle(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/operacao/pedidos/${order.id}`}
                      className="font-mono text-xs text-brand-800 hover:underline"
                    >
                      {order.protocol}
                    </Link>
                    <p className="text-[11px] text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900">{order.customerName}</p>
                    <p className="text-[11px] text-neutral-500">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell>{order.certificates.join(", ")}</TableCell>
                  <TableCell>
                    <StatusBadge status={meta.semantic} label={meta.label} size="sm" />
                    {step !== meta.label && (
                      <p className="mt-1 text-[11px] text-neutral-500">{step}</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog isOpen={dialog === "status"} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <DialogTitle>Alterar status de {selection.count} pedido(s)</DialogTitle>
          <DialogDescription>
            Cada pedido segue a mesma regra da tela individual. Pagamento não muda por aqui.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <Select
            label="Novo status"
            value={targetStatus}
            onChange={(event) => setTargetStatus(event.target.value)}
            placeholder="Escolha o status"
            options={STAFF_STATUS_OPTIONS}
          />
          {targetStatus && (
            <p className="text-sm text-neutral-700">
              Vale para <strong>{statusEligible.length}</strong> de {selection.count}.
              {statusEligible.length < selection.count &&
                " Os demais não aceitam esse status agora e ficam como estão."}
            </p>
          )}
          <Textarea
            label="Mensagem ao cliente (opcional)"
            helperText="Vai para a conversa de cada pedido alterado, junto com o e-mail de status."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={busy}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              runBulk(
                { action: "status", status: targetStatus, note },
                statusEligible.map((order) => order.id)
              )
            }
            disabled={busy || statusEligible.length === 0}
          >
            {busy ? "Aplicando…" : `Aplicar em ${statusEligible.length}`}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog isOpen={dialog === "delete"} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <DialogTitle>Excluir pedidos definitivamente</DialogTitle>
          <DialogDescription>
            Some o pedido, as mensagens, os arquivos e o histórico. Não dá para desfazer.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-sm text-neutral-700">
            <strong>{deleteEligible.length}</strong> de {selection.count} podem ser excluídos.
          </p>
          {deleteEligible.length < selection.count && (
            <Alert variant="warning">
              Só saem pedidos que nunca viraram compra: rascunho, aguardando pagamento ou cancelado, sem pagamento
              aprovado, em análise ou estornado (e sem PIX gerado na última hora). Para os demais, use
              &quot;Alterar status&quot; → Cancelado.
            </Alert>
          )}
          <Input
            label={`Digite ${DELETE_CONFIRM_WORD} para confirmar`}
            value={confirmWord}
            onChange={(event) => setConfirmWord(event.target.value)}
            autoComplete="off"
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              runBulk(
                { action: "delete", confirm: confirmWord },
                deleteEligible.map((order) => order.id)
              )
            }
            disabled={
              busy ||
              deleteEligible.length === 0 ||
              confirmWord.trim().toUpperCase() !== DELETE_CONFIRM_WORD
            }
          >
            {busy ? "Excluindo…" : `Excluir ${deleteEligible.length}`}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
