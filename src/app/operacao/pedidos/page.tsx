"use client";

import * as React from "react";
import Link from "next/link";
import { Download, RefreshCw, Trash2, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  BULK_ORDER_LIMIT,
  DELETE_CONFIRM_WORD,
  ordersToCsv,
} from "@/lib/order-bulk";
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

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function OperacaoPage() {
  const [orders, setOrders] = React.useState<OpsOrder[]>([]);
  const [canDelete, setCanDelete] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
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
        const next: OpsOrder[] = data.orders || [];
        setOrders(next);
        setCanDelete(Boolean(data.canDelete));
        // Seleção só guarda o que ainda existe.
        setSelected((prev) => new Set(next.filter((order) => prev.has(order.id)).map((order) => order.id)));
      })
      .catch(() => setError("Falha ao carregar a fila operacional."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const visible = React.useMemo(() => {
    const q = normalize(query.trim());
    return orders.filter((order) => {
      if (statusFilter && displayOrderStatus(order.status, order.paymentStatus) !== statusFilter) return false;
      if (!q) return true;
      return normalize(
        [order.protocol, order.customerName, order.customerEmail, ...order.certificates].join(" ")
      ).includes(q);
    });
  }, [orders, query, statusFilter]);

  const selectedOrders = orders.filter((order) => selected.has(order.id));
  const allVisibleSelected = visible.length > 0 && visible.every((order) => selected.has(order.id));
  const statusEligible = targetStatus
    ? selectedOrders.filter((order) => order.allowedStatuses.includes(targetStatus))
    : [];
  const deleteEligible = selectedOrders.filter((order) => order.deletable);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((order) => next.delete(order.id));
      else visible.forEach((order) => next.add(order.id));
      return next;
    });
  }

  function exportCsv() {
    const rows = (selectedOrders.length ? selectedOrders : visible).map((order) => ({
      ...order,
      statusLabel: displayStatusMeta(order.status, order.paymentStatus).label,
    }));
    const blob = new Blob([ordersToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      setSelected(new Set());
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
        title="Mesa operacional"
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

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="sm:max-w-sm w-full">
          <Input
            label="Buscar"
            placeholder="Protocolo, cliente, e-mail ou certidão"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="sm:w-60">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={STATUS_FILTERS}
          />
        </div>
        <Button variant="ghost" size="md" onClick={() => load()} disabled={loading} className="sm:ml-auto">
          <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} aria-hidden />
          Atualizar
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-brand-950">{selected.size} selecionado(s)</span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <Button
            size="sm"
            onClick={() => setDialog("status")}
            disabled={selected.size > BULK_ORDER_LIMIT}
          >
            Alterar status
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="w-4 h-4" aria-hidden />
            Exportar CSV
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDialog("delete")}
              disabled={selected.size > BULK_ORDER_LIMIT}
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              Excluir
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="ml-auto">
            Limpar seleção
          </Button>
          {selected.size > BULK_ORDER_LIMIT && (
            <p className="basis-full text-xs text-semantic-error">
              Ações em massa aceitam até {BULK_ORDER_LIMIT} pedidos por vez.
            </p>
          )}
        </div>
      )}

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
                <Checkbox
                  aria-label="Selecionar todos os pedidos visíveis"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
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
              const isSelected = selected.has(order.id);
              return (
                <TableRow key={order.id} className={isSelected ? "bg-brand-50/60" : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Selecionar pedido ${order.protocol}`}
                      checked={isSelected}
                      onChange={() => toggle(order.id)}
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
          <DialogTitle>Alterar status de {selected.size} pedido(s)</DialogTitle>
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
              Vale para <strong>{statusEligible.length}</strong> de {selected.size}.
              {statusEligible.length < selected.size &&
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
            <strong>{deleteEligible.length}</strong> de {selected.size} podem ser excluídos.
          </p>
          {deleteEligible.length < selected.size && (
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
