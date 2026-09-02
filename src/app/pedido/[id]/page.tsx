"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Copy } from "lucide-react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { MercadoPagoCardBrick } from "@/components/storefront/mercadopago-card-brick";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { PixQr } from "@/components/storefront/pix-qr";
import { formatCurrency } from "@/lib/utils";

interface PublicOrder {
  id: string;
  protocol: string;
  status: string;
  totalAmount: number;
  items: Array<{
    id: string;
    certificateName: string;
    city: string;
    state: string;
    totalPrice: number;
  }>;
  payment: {
    status: string;
    amount: number;
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
    method?: "PIX" | "CREDIT_CARD";
  } | null;
}

function livePixCode(qrCode?: string) {
  if (!qrCode) return "";
  if (/^CARTORI-.+-DEMO$/i.test(qrCode)) return "";
  return qrCode;
}

function orderQuery() {
  if (typeof window === "undefined") return "";
  return window.location.search || "";
}

export default function PedidoPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/orders/${params.id}${orderQuery()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Pedido não encontrado.");
      return;
    }
    setOrder(data.order);
    setError(data.paymentError || "");
  };

  useEffect(() => {
    if (!params.id) return;
    load().catch(() => setError("Falha ao carregar o pedido."));
    const timer = window.setInterval(() => {
      load().catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const pixCode = livePixCode(order?.payment?.qrCode);
  const isCard = order?.payment?.method === "CREDIT_CARD";

  const copyPix = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const payCard = async (card: Record<string, unknown>) => {
    const res = await fetch(`/api/orders/${params.id}/card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    const data = await res.json();
    if (!data.success) {
      const fail = data.error || "Não foi possível pagar com cartão.";
      setError(fail);
      throw new Error(fail);
    }
    setOrder(data.order);
    setError("");
  };

  const paid = order?.status === "PAID" || order?.payment?.status === "APPROVED";

  return (
    <StorefrontShell>
      <section className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Stepper
            steps={[
              { id: 1, title: "Pedido", status: "completed" },
              { id: 2, title: "Checkout", status: "completed" },
              {
                id: 3,
                title: "Pagamento",
                status: paid ? "completed" : "current",
              },
            ]}
          />

          {!order && !error && (
            <p className="text-sm text-neutral-500">Carregando pedido...</p>
          )}
          {error && <Alert variant="error" title="Erro">{error}</Alert>}

          {order && paid && (
            <div className="rounded-2xl border border-semantic-success-border bg-semantic-success-bg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-semantic-success shrink-0" />
                <div>
                  <h1 className="text-2xl font-serif font-bold text-neutral-900">
                    Pagamento confirmado
                  </h1>
                  <p className="text-sm text-neutral-700 mt-1">
                    Protocolo <strong>{order.protocol}</strong>. A emissão entra na fila operacional.
                    O acompanhamento detalhado será no painel.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button>Abrir painel</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Nova solicitação</Button>
                </Link>
              </div>
            </div>
          )}

          {order && !paid && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
                  {isCard ? "Aguardando cartão" : "Aguardando PIX"}
                </p>
                <h1 className="text-2xl font-serif font-bold text-neutral-900">
                  {order.protocol}
                </h1>
                <p className="text-sm text-neutral-600 mt-1">
                  {isCard
                    ? `Pague com cartão aqui mesmo. Valor: ${formatCurrency(order.totalAmount)}.`
                    : `Escaneie o QR Code ou copie o código PIX. Valor: ${formatCurrency(order.totalAmount)}.`}
                </p>
              </div>

              {isCard ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
                  <p className="text-xs text-neutral-500">
                    Checkout transparente do Mercado Pago. A Cartori não vê nem guarda o número do cartão.
                  </p>
                  <MercadoPagoCardBrick
                    amount={order.payment?.amount || order.totalAmount}
                    onPay={payCard}
                    onError={setError}
                  />
                </div>
              ) : (
                <>
                  <PixQr qrCode={pixCode} qrCodeBase64={order.payment?.qrCodeBase64} />

                  {pixCode && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-neutral-700">PIX copia e cola</p>
                      <div className="flex gap-2">
                        <code className="flex-1 text-[11px] break-all bg-neutral-50 border border-neutral-200 rounded-md p-3">
                          {pixCode}
                        </code>
                        <Button type="button" variant="outline" onClick={copyPix} aria-label="Copiar PIX">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {copied && (
                        <p className="text-xs text-semantic-success">Código copiado.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <ul className="text-sm text-neutral-700 space-y-1.5 border-t border-neutral-100 pt-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>
                      {item.certificateName}
                      <span className="block text-xs text-neutral-500">
                        {item.city}/{item.state}
                      </span>
                    </span>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </StorefrontShell>
  );
}
