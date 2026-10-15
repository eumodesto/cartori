"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock3, FileText, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PurchaseConversion } from "@/components/analytics/purchase-conversion";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { isOrderPaid, type PublicOrder } from "@/lib/order-status";
import { formatCurrency } from "@/lib/utils";

const NEXT_STEPS = [
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Pedido na fila de emissão",
    text: "Nossa equipe confere os dados e solicita a certidão ao cartório.",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    title: "Avisos por e-mail",
    text: "Você recebe um e-mail a cada mudança de status ou se precisarmos de alguma informação.",
  },
  {
    icon: <Clock3 className="w-4 h-4" />,
    title: "Acompanhe pelo painel",
    text: "Status, mensagens da equipe e o documento emitido ficam no seu painel.",
  },
];

export function ConfirmadoView({ adsSendTo }: { adsSendTo: string | null }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [order, setOrder] = React.useState<PublicOrder | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!params.id || authLoading) return;
    const next = `/pedido/${params.id}/confirmado`;
    if (!profile) {
      window.location.assign(`/?entrar=1&next=${encodeURIComponent(next)}`);
      return;
    }

    fetch(`/api/orders/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          window.location.assign(`/?entrar=1&next=${encodeURIComponent(next)}`);
          return;
        }
        const data = await res.json();
        if (!data.success || !data.order) {
          setError("Pedido não encontrado.");
          return;
        }
        if (!isOrderPaid(data.order)) {
          router.replace(`/pedido/${params.id}`);
          return;
        }
        setOrder(data.order);
      })
      .catch(() => setError("Falha ao carregar o pedido."));
  }, [params.id, profile, authLoading, router]);

  return (
    <StorefrontShell>
      <section className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Stepper
            steps={[
              { id: 1, title: "Pedido", status: "completed" },
              { id: 2, title: "Checkout", status: "completed" },
              { id: 3, title: "Pagamento", status: order ? "completed" : "current" },
            ]}
          />

          {error && (
            <>
              <Alert variant="error" title="Pedido">
                {error}
              </Alert>
              <Link href="/painel/pedidos">
                <Button variant="outline">Ver meus pedidos</Button>
              </Link>
            </>
          )}

          {!error && !order && (
            <p className="text-sm text-neutral-500">Confirmando o pagamento...</p>
          )}

          {order && (
            <>
              <PurchaseConversion order={order} adsSendTo={adsSendTo} />

              <div className="rounded-2xl border border-semantic-success-border bg-semantic-success-bg p-6 sm:p-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-semantic-success" />
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
                  Obrigado! Pagamento confirmado.
                </h1>
                <p className="text-sm text-neutral-700">
                  Seu pedido <strong className="font-mono">{order.protocol}</strong> foi recebido e
                  já está com a nossa equipe.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-4">
                <h2 className="text-sm font-bold text-neutral-900">Resumo do pedido</h2>
                <ul className="text-sm text-neutral-700 space-y-2">
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
                <div className="flex justify-between border-t border-neutral-100 pt-3 text-sm font-bold text-neutral-900">
                  <span>Total pago</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-4">
                <h2 className="text-sm font-bold text-neutral-900">Próximos passos</h2>
                <ul className="space-y-3">
                  {NEXT_STEPS.map((step) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
                        {step.icon}
                      </span>
                      <span className="text-sm">
                        <span className="block font-semibold text-neutral-900">{step.title}</span>
                        <span className="text-neutral-600">{step.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/painel/pedidos/${order.id}`}>
                  <Button>Acompanhar pedido</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Nova solicitação</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </StorefrontShell>
  );
}
