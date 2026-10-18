"use client";

import * as React from "react";
import { CalendarClock, Check, XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CANCEL_REASON_MIN,
  CANCEL_SERVICE_FEE,
  type OrderJourney,
  cancellationPolicyLines,
} from "@/lib/cancellation-policy";
import {
  JOURNEY_STEPS,
  type JourneyDisplay,
  deadlineText,
  journeyCopy,
  journeyStepIndex,
} from "@/lib/order-journey";
import { cn, formatCurrency } from "@/lib/utils";

const TONE: Record<string, string> = {
  info: "border-brand-200 bg-brand-50/60",
  success: "border-semantic-success-border bg-semantic-success-bg",
  warning: "border-semantic-warning-border bg-semantic-warning-bg",
  error: "border-semantic-error-border bg-semantic-error-bg",
  neutral: "border-neutral-200 bg-neutral-50",
};

/** Etapa atual em linguagem simples, linha do tempo, prazo e cancelamento (cliente). */
export function OrderJourneyCard({
  orderId,
  display,
  internalStatus,
  journey,
  onChanged,
}: {
  orderId: string;
  display: JourneyDisplay;
  internalStatus: string;
  journey: OrderJourney;
  onChanged: (data: unknown) => void;
}) {
  const pendingRequest = journey.request?.status === "PENDING";
  const copy = journeyCopy(pendingRequest ? "CANCEL_REQUESTED" : display, internalStatus);
  const closed = ["CANCELLED", "REFUNDED"].includes(display) || internalStatus === "CANCELLED";
  const step = journeyStepIndex(internalStatus);
  const deadline = deadlineText(journey.deadline);
  const option = journey.cancellation;

  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [accepted, setAccepted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const isRefund = option.kind === "refund";
  const canAct = (option.kind === "cancel_unpaid" || option.kind === "refund") && option.allowed;

  const close = () => {
    if (busy) return;
    setOpen(false);
    setReason("");
    setAccepted(false);
    setError("");
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/cancellation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, accepted }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setError(data.error || "Não foi possível registrar o cancelamento.");
        return;
      }
      setOpen(false);
      setReason("");
      setAccepted(false);
      onChanged(data);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border p-5 space-y-4", TONE[copy.tone])}>
      <div>
        <p className="text-sm font-semibold text-neutral-900">{copy.title}</p>
        <p className="mt-1 text-sm text-neutral-700 leading-relaxed">{copy.text}</p>
        {pendingRequest && journey.request && (
          <p className="mt-2 text-xs text-neutral-600">
            Pedido feito em {new Date(journey.request.createdAt).toLocaleString("pt-BR")}. Valor a estornar se
            aprovado: <strong>{formatCurrency(journey.request.refundAmount)}</strong> (taxa de serviço de{" "}
            {formatCurrency(journey.request.feeAmount)} retida).
          </p>
        )}
        {journey.request?.status === "REJECTED" && (
          <p className="mt-2 text-xs text-neutral-600">
            O último pedido de cancelamento não foi aprovado
            {journey.request.resolutionNote ? `: ${journey.request.resolutionNote}` : "."}
          </p>
        )}
      </div>

      {!closed && (
        <ol className="grid grid-cols-5 gap-1" aria-label="Etapas do pedido">
          {JOURNEY_STEPS.map((label, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={label} className="flex flex-col items-center gap-1 text-center">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold",
                    done && "border-brand-700 bg-brand-700 text-neutral-0",
                    current && "border-brand-700 bg-neutral-0 text-brand-800",
                    !done && !current && "border-neutral-300 bg-neutral-0 text-neutral-400"
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className={cn("text-[11px]", current ? "font-semibold text-neutral-900" : "text-neutral-500")}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {deadline && !closed && (
        <p className="flex items-start gap-2 text-sm text-neutral-800">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
          {deadline}
        </p>
      )}

      {(option.kind === "cancel_unpaid" || option.kind === "refund") && (
        <div className="flex flex-col gap-2 border-t border-black/5 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-600">
            {option.allowed
              ? isRefund
                ? `Pode cancelar até ${new Date(option.deadline).toLocaleDateString("pt-BR")}. A taxa de serviço de ${formatCurrency(CANCEL_SERVICE_FEE)} fica retida.`
                : "Ainda não pago: o cancelamento é imediato e sem custo."
              : option.reason}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={!canAct}
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            {isRefund ? "Cancelar e pedir estorno" : "Cancelar pedido"}
          </Button>
        </div>
      )}

      <Dialog isOpen={open} onClose={close} size="lg">
        <DialogHeader onClose={close}>
          <DialogTitle>{isRefund ? "Cancelar e pedir estorno" : "Cancelar pedido"}</DialogTitle>
          <DialogDescription>Política de cancelamento da InterJuri.</DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
            {cancellationPolicyLines(journey.total).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500">
            Política completa no item 6 dos{" "}
            <a href="/termos#cancelamento" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 underline">
              Termos de Uso
            </a>
            .
          </p>
          {option.kind === "refund" && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
              <div className="flex justify-between">
                <span>Valor pago</span>
                <span>{formatCurrency(journey.total)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Taxa de serviço retida</span>
                <span>− {formatCurrency(option.fee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                <span>Estorno, se aprovado</span>
                <span>{formatCurrency(option.refundAmount)}</span>
              </div>
            </div>
          )}
          {error && <Alert variant="error">{error}</Alert>}
          <Textarea
            label="Motivo do cancelamento"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Conte em poucas palavras por que quer cancelar."
          />
          <Checkbox
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            label={
              isRefund
                ? "Li a política e concordo com a retenção da taxa de serviço."
                : "Quero cancelar este pedido."
            }
          />
          {isRefund && (
            <p className="text-xs text-neutral-500">
              Depois de enviar, o pedido fica com o status &quot;Cancelamento solicitado&quot; até o setor responsável
              confirmar a ação.
            </p>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={close} disabled={busy}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            isLoading={busy}
            disabled={!accepted || reason.trim().length < CANCEL_REASON_MIN}
          >
            {isRefund ? "Enviar pedido de cancelamento" : "Cancelar pedido"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
