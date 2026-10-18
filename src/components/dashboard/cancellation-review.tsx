"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { OrderJourney } from "@/lib/cancellation-policy";
import { formatCurrency } from "@/lib/utils";

/** Mesa: pedido de cancelamento em análise, com aprovar (estorno) ou recusar. */
export function CancellationReview({
  orderId,
  journey,
  canApprove,
  onDone,
}: {
  orderId: string;
  journey: OrderJourney;
  canApprove: boolean;
  onDone: () => void;
}) {
  const request = journey.request;
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState<"approve" | "reject" | null>(null);
  const [error, setError] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);

  if (!request || request.status !== "PENDING") return null;

  const run = async (action: "approve" | "reject") => {
    setBusy(action);
    setError("");
    try {
      const res = await fetch(`/api/ops/orders/${orderId}/cancellation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setError(data.error || "Não foi possível concluir.");
        return;
      }
      setNote("");
      setConfirming(false);
      onDone();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl border border-semantic-warning-border bg-semantic-warning-bg p-5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-neutral-900">Cancelamento solicitado pelo cliente</p>
        <p className="text-xs text-neutral-600">
          Em {new Date(request.createdAt).toLocaleString("pt-BR")}. Motivo: “{request.reason}”
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-neutral-0/70 p-3 text-sm">
        <div>
          <p className="text-[11px] uppercase text-neutral-500">Pago</p>
          <p className="font-semibold">{formatCurrency(journey.total)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-neutral-500">Taxa retida</p>
          <p className="font-semibold">{formatCurrency(request.feeAmount)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-neutral-500">Estornar</p>
          <p className="font-semibold">{formatCurrency(request.refundAmount)}</p>
        </div>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <Textarea
        label="Observação para o cliente"
        helperText="Obrigatória ao recusar. Vai na mensagem e no e-mail."
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {confirming ? (
        <Alert variant="warning" title="Antes de aprovar">
          Faça o estorno de {formatCurrency(request.refundAmount)} no Mercado Pago (ou no banco) primeiro. Aprovar aqui só
          registra o estorno, cancela o pedido e avisa o cliente.
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => run("approve")} isLoading={busy === "approve"}>
              Já estornei, aprovar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={Boolean(busy)}>
              Voltar
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={!canApprove || Boolean(busy)}
            title={canApprove ? undefined : "Exige administrador com permissão de pagamento manual"}
          >
            Aprovar cancelamento e estorno
          </Button>
          <Button size="sm" variant="outline" onClick={() => run("reject")} isLoading={busy === "reject"} disabled={note.trim().length < 5}>
            Recusar
          </Button>
          {!canApprove && (
            <p className="basis-full text-xs text-neutral-600">
              Aprovar exige administrador com permissão de pagamento manual. Você pode recusar com uma observação.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
