"use client";

import * as React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
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
import type { AdminUserOrder } from "@/lib/admin-orders";
import { downloadCsv, formatCsvDate, toCsv } from "@/lib/csv";
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";
import { ORDER_CATEGORIES, inOrderCategory } from "@/lib/order-categories";
import { MANUAL_REASON_MIN, type ManualPaymentAction } from "@/lib/manual-payment-policy";
import { DISPLAY_STATUS_META, orderStepLabel, staffStatusLabel } from "@/lib/order-status";
import { formatCurrency } from "@/lib/utils";

const PAYMENT_ACTION_WARNING: Record<ManualPaymentAction, string> = {
  PAYMENT_APPROVED:
    "Use só quando o pagamento foi confirmado fora do site (ex.: transferência conferida no extrato). O pedido segue para emissão com o valor do pedido.",
  PAYMENT_REJECTED:
    "Marca a cobrança como recusada. O cliente continua podendo pagar pelo painel; se o Mercado Pago confirmar um pagamento depois, ele prevalece.",
  REFUNDED:
    "Isto não devolve o dinheiro. Faça o estorno no Mercado Pago ou no banco antes; aqui só registra o estorno e cancela o pedido.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value)
  );
}

function isPaymentAction(order: AdminUserOrder, value: string): value is ManualPaymentAction {
  return (order.paymentActions as string[]).includes(value);
}

function StatusEditor({
  order,
  onDone,
  onCancel,
}: {
  order: AdminUserOrder;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [target, setTarget] = React.useState("");
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const options = [
    ...order.documentTargets.map((value) => ({ value, label: staffStatusLabel(value) })),
    ...order.paymentActions.map((value) => ({
      value,
      label: `${DISPLAY_STATUS_META[value].label} (manual)`,
    })),
  ];
  const payment = isPaymentAction(order, target);
  const reasonTooShort = payment && text.trim().length < MANUAL_REASON_MIN;

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment ? { target, reason: text } : { target, note: text }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Não foi possível alterar o status.");
        return;
      }
      onDone();
    } catch {
      setError("Falha ao alterar o status.");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">Nenhuma mudança de status disponível para este pedido.</p>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Select
        label="Novo status"
        placeholder="Escolha o novo status"
        value={target}
        onChange={(event) => {
          setTarget(event.target.value);
          setText("");
        }}
        options={options}
      />
      {target && payment && (
        <Alert variant="warning">{PAYMENT_ACTION_WARNING[target as ManualPaymentAction]}</Alert>
      )}
      {target && (
        <Textarea
          label={payment ? "Motivo (obrigatório, fica no histórico interno)" : "Mensagem ao cliente (opcional)"}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder={
            payment
              ? "Ex.: PIX recebido por transferência em 15/10, conferido no extrato."
              : "Aparece no painel do cliente junto com o novo status."
          }
        />
      )}
      {target && !payment && (
        <p className="text-[11px] text-neutral-500">O cliente recebe e-mail com o novo status.</p>
      )}
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button size="sm" onClick={submit} isLoading={saving} disabled={!target || reasonTooShort}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}

export function UserOrders({ userId }: { userId: string }) {
  const [orders, setOrders] = React.useState<AdminUserOrder[] | null>(null);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const rows = React.useMemo(() => orders ?? [], [orders]);
  const selection = useRowSelection(rows);

  const visible = rows.filter(
    (order) =>
      inOrderCategory(category, order.display) &&
      inPeriod(order.createdAt, period) &&
      matchesSearch(query, [order.protocol, ...order.certificates])
  );

  const exportCsv = (list: AdminUserOrder[]) =>
    downloadCsv(
      "pedidos-do-usuario",
      toCsv(
        ["Protocolo", "Data", "Certidões", "Status", "Valor"],
        list.map((order) => [
          order.protocol,
          formatCsvDate(order.createdAt),
          order.certificates.join(", "),
          DISPLAY_STATUS_META[order.display].label,
          formatCurrency(order.totalAmount),
        ])
      )
    );

  const load = React.useCallback(() => {
    fetch(`/api/admin/users/${userId}/orders`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar os pedidos.");
          return;
        }
        setOrders(data.orders);
      })
      .catch(() => setError("Falha ao carregar os pedidos."));
  }, [userId]);

  React.useEffect(load, [load]);

  return (
    <section className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
      <h2 className="text-sm font-semibold text-neutral-900">Pedidos</h2>
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      {orders === null && !error ? (
        <p className="text-sm text-neutral-500">Carregando pedidos...</p>
      ) : orders && orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Este usuário ainda não fez pedidos.</p>
      ) : orders ? (
        <>
        <CategoryChips
          total={rows.length}
          value={category}
          onChange={setCategory}
          items={ORDER_CATEGORIES.map((item) => ({
            id: item.id,
            label: item.label,
            count: rows.filter((order) => item.statuses.includes(order.display)).length,
          }))}
        />
        <ListToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Protocolo ou certidão"
          shown={visible.length}
          total={rows.length}
          onReset={() => {
            setCategory("");
            setQuery("");
            setPeriod("");
          }}
          actions={
            <Button variant="outline" size="md" onClick={() => exportCsv(visible)} disabled={!visible.length}>
              <Download className="w-4 h-4" aria-hidden />
              Exportar lista
            </Button>
          }
        >
          <Select aria-label="Data do pedido" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
        </ListToolbar>
        <BulkActionBar count={selection.count} onClear={selection.clear}>
          <Button size="sm" variant="outline" onClick={() => exportCsv(selection.selectedRows)}>
            <Download className="w-4 h-4" aria-hidden />
            Exportar CSV
          </Button>
        </BulkActionBar>
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
              <TableHead>Certidões</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((order) => {
              const meta = DISPLAY_STATUS_META[order.display];
              const step = orderStepLabel(order.status);
              return (
                <React.Fragment key={order.id}>
                  <TableRow isSelected={editing === order.id || selection.isSelected(order.id)}>
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
                    </TableCell>
                    <TableCell>{order.certificates.join(", ")}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="text-neutral-500">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={meta.semantic} label={meta.label} size="sm" />
                      <p className="mt-1 text-[11px] text-neutral-500">
                        {step !== meta.label ? step : null}
                        {order.manualPayment ? `${step !== meta.label ? " · " : ""}pagamento manual` : null}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMessage("");
                          setEditing(editing === order.id ? null : order.id);
                        }}
                      >
                        Alterar status
                      </Button>
                    </TableCell>
                  </TableRow>
                  {editing === order.id && (
                    <TableRow isSelected>
                      <TableCell colSpan={7}>
                        <StatusEditor
                          order={order}
                          onCancel={() => setEditing(null)}
                          onDone={() => {
                            setEditing(null);
                            setMessage(`Status do pedido ${order.protocol} atualizado.`);
                            load();
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        </>
      ) : null}
    </section>
  );
}
