"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, Send } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";

type OutboxStatus = "PENDING" | "SENT" | "FAILED";
type OutboxRow = {
  id: string;
  toEmail: string;
  template: string;
  subject: string;
  status: OutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
  orderId: string | null;
  protocol: string | null;
};

const STATUS_META: Record<OutboxStatus, { label: string; semantic: "success" | "warning" | "error" }> = {
  SENT: { label: "Enviado", semantic: "success" },
  PENDING: { label: "Pendente", semantic: "warning" },
  FAILED: { label: "Falhou", semantic: "error" },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** Registro dos e-mails enviados pelo sistema, com reenvio e e-mail de teste. */
export function EmailOutboxLog() {
  const [rows, setRows] = React.useState<OutboxRow[]>([]);
  const [counts, setCounts] = React.useState<Record<OutboxStatus, number>>({ PENDING: 0, SENT: 0, FAILED: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState<{ variant: "success" | "warning" | "error"; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [template, setTemplate] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const [testTo, setTestTo] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    return fetch("/api/admin/email-outbox", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar o registro.");
          return;
        }
        setError("");
        setRows(data.rows || []);
        setCounts(data.counts || { PENDING: 0, SENT: 0, FAILED: 0 });
      })
      .catch(() => setError("Falha ao carregar o registro de envios."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const selection = useRowSelection(rows);

  const visible = rows.filter(
    (row) =>
      (!status || row.status === status) &&
      (!template || row.template === template) &&
      inPeriod(row.createdAt, period) &&
      matchesSearch(query, [row.toEmail, row.subject, row.protocol, row.template, row.lastError])
  );

  const templates = Array.from(new Set(rows.map((row) => row.template))).sort();
  const unsent = counts.PENDING + counts.FAILED;

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/email-outbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setNotice({ variant: "error", text: data.error || "Não foi possível concluir." });
        return;
      }
      if (payload.action === "test") {
        setNotice({ variant: "success", text: `E-mail de teste enviado para ${payload.to}. Confira a caixa de entrada e o spam.` });
      } else {
        const failed = (data.failed || []) as Array<{ error: string }>;
        setNotice({
          variant: failed.length ? "warning" : "success",
          text: `${data.sent} reenviado(s).${failed.length ? ` ${failed.length} falharam de novo: ${failed[0].error}` : ""}`,
        });
        selection.clear();
      }
      await load();
    } catch {
      setNotice({ variant: "error", text: "Falha de conexão." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Registro de envios</h2>
          <p className="text-xs text-neutral-500">
            Os {rows.length} e-mails mais recentes que o sistema enviou ou tentou enviar.
          </p>
        </div>
        {unsent > 0 && (
          <Button size="sm" onClick={() => post({ action: "resend_unsent" })} disabled={busy}>
            Reenviar pendentes e falhas ({unsent})
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {notice && <Alert variant={notice.variant}>{notice.text}</Alert>}

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end rounded-xl bg-neutral-50 border border-neutral-200 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          post({ action: "test", to: testTo });
        }}
      >
        <div className="sm:w-80">
          <Input
            label="Enviar e-mail de teste para"
            type="email"
            required
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="voce@empresa.com.br"
          />
        </div>
        <Button type="submit" variant="outline" disabled={busy}>
          <Send className="w-4 h-4" aria-hidden />
          Enviar teste
        </Button>
      </form>

      <CategoryChips
        total={rows.length}
        value={status}
        onChange={setStatus}
        items={(["SENT", "PENDING", "FAILED"] as OutboxStatus[]).map((value) => ({
          id: value,
          label: STATUS_META[value].label,
          count: rows.filter((row) => row.status === value).length,
        }))}
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="E-mail, assunto, protocolo ou erro"
        shown={visible.length}
        total={rows.length}
        onReset={() => {
          setStatus("");
          setQuery("");
          setTemplate("");
          setPeriod("");
        }}
        actions={
          <Button variant="ghost" size="md" onClick={() => load()} disabled={loading} aria-label="Atualizar">
            <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} aria-hidden />
          </Button>
        }
      >
        <Select
          aria-label="Template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          options={[{ value: "", label: "Todos os templates" }, ...templates.map((key) => ({ value: key, label: key }))]}
        />
        <Select aria-label="Data do envio" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
      </ListToolbar>

      <BulkActionBar count={selection.count} onClear={selection.clear}>
        <Button
          size="sm"
          onClick={() => post({ action: "resend", ids: selection.selectedRows.map((row) => row.id) })}
          disabled={busy}
        >
          Reenviar selecionados
        </Button>
        <span className="text-xs text-neutral-500">E-mails já enviados não são reenviados.</span>
      </BulkActionBar>

      {loading && rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {rows.length === 0 ? "Nenhum envio registrado ainda." : "Nenhum envio com esses filtros."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectAllCheckbox checked={selection.allSelected(visible)} onChange={() => selection.toggleAll(visible)} />
              </TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => {
              const meta = STATUS_META[row.status];
              return (
                <TableRow key={row.id} isSelected={selection.isSelected(row.id)}>
                  <TableCell>
                    <RowCheckbox
                      label={`Selecionar envio para ${row.toEmail}`}
                      checked={selection.isSelected(row.id)}
                      onChange={() => selection.toggle(row.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-neutral-900">{row.toEmail}</p>
                    {row.protocol && row.orderId && (
                      <Link href={`/operacao/pedidos/${row.orderId}`} className="font-mono text-[11px] text-brand-800 hover:underline">
                        {row.protocol}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-neutral-800">{row.subject}</p>
                    <p className="font-mono text-[11px] text-neutral-400">{row.template}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={meta.semantic} label={meta.label} size="sm" />
                    {row.lastError && row.status !== "SENT" && (
                      <p className="mt-1 max-w-xs break-words text-[11px] text-semantic-error">{row.lastError}</p>
                    )}
                    {row.attempts > 1 && <p className="text-[11px] text-neutral-500">{row.attempts} tentativas</p>}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">{formatDate(row.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
