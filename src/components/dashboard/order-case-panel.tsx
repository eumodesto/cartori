"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Paperclip, Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CASE_ATTACHMENT_KINDS,
  type PublicOrderCase,
} from "@/lib/case-types";
import { orderStatusMeta, STAFF_STATUS_OPTIONS } from "@/lib/order-status";

function authorLabel(kind: string) {
  if (kind === "STAFF") return "Cartori";
  if (kind === "SYSTEM") return "Sistema";
  return "Você";
}

export function OrderCasePanel({
  orderId,
  staff = false,
}: {
  orderId: string;
  staff?: boolean;
}) {
  const [data, setData] = React.useState<PublicOrderCase | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [body, setBody] = React.useState("");
  const [kind, setKind] = React.useState("RG");
  const [status, setStatus] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const endpoint = staff ? `/api/ops/orders/${orderId}` : `/api/orders/${orderId}/messages`;

  const load = React.useCallback(async () => {
    const res = await fetch(endpoint, { cache: "no-store" });
    const json = await res.json();
    if (!json.success) {
      setError(json.error || "Não foi possível abrir o caso.");
      setData(null);
      return;
    }
    setData(json);
    setStatus(json.order.status);
    setError("");
  }, [endpoint]);

  React.useEffect(() => {
    load()
      .catch(() => setError("Falha ao carregar o caso."))
      .finally(() => setLoading(false));
  }, [load]);

  const sendMessage = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Não foi possível enviar.");
        return;
      }
      setBody("");
      setData(json);
    } catch {
      setError("Falha ao enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file: File | undefined) => {
    if (!file) return;
    setSending(true);
    setError("");
    try {
      const init = await fetch(`/api/orders/${orderId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          sizeBytes: file.size,
        }),
      });
      const json = await init.json();
      if (!json.success) {
        setError(json.error || "Não foi possível preparar o envio.");
        return;
      }
      const put = await fetch(json.upload.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) {
        setError("O arquivo não chegou ao armazenamento.");
        return;
      }
      await load();
    } catch {
      setError("Falha no envio do arquivo.");
    } finally {
      setSending(false);
    }
  };

  const download = async (attachmentId: string) => {
    const res = await fetch(`/api/orders/${orderId}/attachments/${attachmentId}`);
    const json = await res.json();
    if (!json.success || !json.url) {
      setError(json.error || "Não foi possível abrir o arquivo.");
      return;
    }
    window.open(json.url, "_blank", "noopener,noreferrer");
  };

  const saveStatus = async () => {
    if (!staff) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/ops/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: body }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Não foi possível atualizar o status.");
        return;
      }
      setBody("");
      setData(json);
      setStatus(json.order.status);
    } catch {
      setError("Falha ao atualizar o status.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando o acompanhamento...</p>;
  }

  if (!data) {
    return (
      <Alert variant="error" title="Pedido">
        {error || "Pedido não encontrado."}{" "}
        <Link href={staff ? "/operacao/pedidos" : "/painel/pedidos"} className="underline">
          Voltar
        </Link>
      </Alert>
    );
  }

  const meta = orderStatusMeta(data.order.status);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
              Protocolo {data.order.protocol}
            </p>
            <h2 className="text-lg font-serif font-bold text-neutral-900">
              {data.order.items.map((item) => item.certificateName).join(", ") || "Solicitação"}
            </h2>
            {staff && (
              <p className="text-sm text-neutral-600">
                {data.order.customerName} · {data.order.customerEmail}
              </p>
            )}
          </div>
          <StatusBadge status={meta.semantic} label={meta.label} />
        </div>
        {staff && (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <Select
              label="Status operacional"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={STAFF_STATUS_OPTIONS}
            />
            <Button variant="primary" onClick={saveStatus} disabled={sending}>
              Atualizar e avisar o cliente
            </Button>
          </div>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900">Mensagens</h3>
        {data.messages.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Ainda não há mensagens neste pedido. A Cartori avisa aqui quando precisar de documento ou resposta.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.messages.map((message) => (
              <li key={message.id} className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {authorLabel(message.authorKind)} ·{" "}
                  {new Date(message.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-neutral-800 mt-1 whitespace-pre-wrap">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
        <Textarea
          label={staff ? "Mensagem para o cliente" : "Responder"}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder={
            staff
              ? "Explique a exigência ou o próximo passo. O cliente recebe e-mail para voltar ao painel."
              : "Escreva sua resposta. Se pedirem um documento, envie na seção abaixo."
          }
        />
        <Button
          variant="primary"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={sendMessage}
          disabled={sending || !body.trim()}
        >
          Enviar mensagem
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900">Documentos</h3>
        <p className="text-sm text-neutral-600">
          PDF, JPG, PNG ou WEBP até 15 MB. RG, CNH, certidões e comprovantes.
        </p>
        {data.attachments.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum arquivo neste pedido.</p>
        ) : (
          <ul className="space-y-2">
            {data.attachments.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-800">
                  {file.originalName}{" "}
                  <span className="text-neutral-500">({file.kind})</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => download(file.id)}
                >
                  Baixar
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Select
            label="Tipo"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            options={CASE_ATTACHMENT_KINDS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
          />
          <label className="inline-flex">
            <input
              type="file"
              className="hidden"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void uploadFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              leftIcon={<Paperclip className="w-4 h-4" />}
              disabled={sending}
              onClick={(event) => {
                const input = (event.currentTarget.parentElement?.querySelector(
                  "input[type=file]"
                ) as HTMLInputElement | null);
                input?.click();
              }}
            >
              Enviar arquivo
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
