"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { PartnerPlanDialog } from "@/components/auth/partner-plan-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { OrderSummary } from "@/components/storefront/order-summary";
import { useCart } from "@/components/cart/cart-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Stepper } from "@/components/ui/stepper";
import { MercadoPagoCardBrick } from "@/components/storefront/mercadopago-card-brick";
import { CustomerData } from "@/lib/types";
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/utils";
import {
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
} from "@/lib/validators";

const emptyCustomer: CustomerData = {
  fullName: "",
  email: "",
  phone: "",
  cpfCnpj: "",
  isCompany: false,
  companyName: "",
  oabOrCreci: "",
  shipping: {
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { profile, loading: authLoading, configured } = useAuth();
  const { items, itemsSubtotal, shippingSubtotal, total, clearCart, hydrated } = useCart();
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [partnerOpen, setPartnerOpen] = useState(false);
  const filledFromProfile = useRef(false);

  const needsAccount = !authLoading && !profile;

  useEffect(() => {
    if (!profile || filledFromProfile.current) return;
    filledFromProfile.current = true;
    setCustomer((prev) => ({
      ...prev,
      fullName: profile.name || prev.fullName,
      email: profile.email || prev.email,
      phone: profile.phone ? maskPhone(profile.phone) : prev.phone,
      cpfCnpj: profile.cpf ? maskCpfCnpj(profile.cpf) : prev.cpfCnpj,
      isCompany: Boolean(profile.organization) || prev.isCompany,
      companyName: profile.organization?.name || prev.companyName,
    }));
  }, [profile]);

  const needsShipping = useMemo(
    () => items.some((item) => item.hasShipping),
    [items]
  );

  const update = <K extends keyof CustomerData>(key: K, value: CustomerData[K]) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const updateShipping = (key: keyof NonNullable<CustomerData["shipping"]>, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      shipping: {
        cep: prev.shipping?.cep || "",
        street: prev.shipping?.street || "",
        number: prev.shipping?.number || "",
        complement: prev.shipping?.complement || "",
        district: prev.shipping?.district || "",
        city: prev.shipping?.city || "",
        state: prev.shipping?.state || "",
        [key]: value,
      },
    }));
    setError("");
  };

  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`/api/cep/${digits}`);
      const data = await res.json();
      if (data.success && data.address) {
        setCustomer((prev) => ({
          ...prev,
          shipping: {
            cep: maskCep(digits),
            street: data.address.logradouro || prev.shipping?.street || "",
            number: prev.shipping?.number || "",
            complement: data.address.complemento || prev.shipping?.complement || "",
            district: data.address.bairro || "",
            city: data.address.localidade || "",
            state: data.address.uf || "",
          },
        }));
      }
    } catch {
      setError("Não foi possível consultar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const validate = () => {
    if (!profile) return "Crie ou entre na conta para concluir o pedido.";
    if (!customer.fullName.trim()) return "Informe o nome completo.";
    if (!isValidEmail(customer.email)) return "Informe um e-mail válido.";
    if (!isValidPhone(customer.phone)) return "Informe um telefone válido com DDD.";
    if (!isValidCpfCnpj(customer.cpfCnpj)) return "Informe um CPF ou CNPJ válido.";
    if (customer.isCompany && !customer.companyName?.trim()) {
      return "Informe a razão social do escritório ou imobiliária.";
    }
    if (needsShipping) {
      const shipping = customer.shipping;
      if (
        !shipping?.cep ||
        !shipping.street ||
        !shipping.number ||
        !shipping.district ||
        !shipping.city ||
        !shipping.state
      ) {
        return "Preencha o endereço de envio das certidões físicas.";
      }
    }
    return "";
  };

  const goToDashboard = (orderId: string) => {
    clearCart();
    router.push(`/dashboard?pedido=${orderId}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      if (!profile) setAuthMode("signup");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "CREDIT_CARD") {
        setError("Preencha o cartão e confirme o pagamento no formulário do Mercado Pago.");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, paymentMethod }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthMode("signup");
        setError(data.error || "Crie ou entre na conta para concluir o pedido.");
        return;
      }
      if (!data.success) {
        setError(data.error || "Não foi possível criar o pedido.");
        return;
      }
      goToDashboard(data.order.id);
    } catch {
      setError("Falha de conexão ao criar o pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPay = async (card: Record<string, unknown>) => {
    const message = validate();
    if (message) {
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, paymentMethod: "CREDIT_CARD", card }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setAuthMode("signup");
        const fail = data.error || "Crie ou entre na conta para concluir o pedido.";
        setError(fail);
        throw new Error(fail);
      }
      if (data.order?.id && data.success) {
        goToDashboard(data.order.id);
        return;
      }
      if (!data.success) {
        const fail = data.error || "Não foi possível pagar com cartão.";
        setError(fail);
        throw new Error(fail);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      setError("Falha de conexão ao pagar com cartão.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || authLoading) {
    return (
      <StorefrontShell>
        <section className="py-16 px-4 text-center">
          <p className="text-sm text-neutral-500">Carregando checkout...</p>
        </section>
      </StorefrontShell>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontShell>
        <section className="py-16 px-4 text-center space-y-3">
          <h1 className="text-2xl font-serif font-bold">Seu pedido está vazio</h1>
          <p className="text-sm text-neutral-600">Adicione certidões na vitrine para ir ao checkout.</p>
          <Link href="/#certidoes">
            <Button>Voltar ao catálogo</Button>
          </Link>
        </section>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
      <AuthDialog
        isOpen={needsAccount}
        onClose={() => undefined}
        nextPath={null}
        required
        initialMode={authMode}
        title="Conta obrigatória para o checkout"
        description="Entre ou crie a conta agora. Depois do pagamento, você acompanha o pedido no Dashboard."
        onAuthenticated={({ wantsPartner }) => {
          if (wantsPartner) setPartnerOpen(true);
        }}
      />
      <PartnerPlanDialog isOpen={partnerOpen} onClose={() => setPartnerOpen(false)} />
      <section className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <Stepper
              steps={[
                { id: 1, title: "Pedido", description: "Certidões", status: "completed" },
                { id: 2, title: "Checkout", description: "Conta e dados", status: "current" },
                { id: 3, title: "Pagamento", description: "PIX ou cartão", status: "upcoming" },
              ]}
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
                Checkout
              </p>
              <h1 className="text-3xl font-serif font-bold text-neutral-900">
                Dados para emissão e cobrança
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                A conta é obrigatória nesta etapa. Depois do pagamento, novos e atuais usuários
                entram no Dashboard para acompanhar o pedido.
              </p>
            </div>
          </div>

          {!configured && (
            <Alert variant="warning" title="Login ainda sem chaves">
              Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para ativar a conta no checkout.
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-neutral-900">Solicitante</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Nome completo"
                      required
                      value={customer.fullName}
                      onChange={(event) => update("fullName", event.target.value)}
                    />
                  </div>
                  <Input
                    label="E-mail"
                    type="email"
                    required
                    value={customer.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                  <Input
                    label="Telefone"
                    required
                    value={customer.phone}
                    onChange={(event) => update("phone", maskPhone(event.target.value))}
                    placeholder="(11) 99999-0000"
                  />
                  <Input
                    label="CPF ou CNPJ"
                    required
                    value={customer.cpfCnpj}
                    onChange={(event) => update("cpfCnpj", maskCpfCnpj(event.target.value))}
                    placeholder="000.000.000-00"
                  />
                  <Input
                    label="OAB ou CRECI (opcional)"
                    value={customer.oabOrCreci || ""}
                    onChange={(event) => update("oabOrCreci", event.target.value)}
                  />
                </div>
                <div className="rounded-md border border-neutral-200 p-3">
                  <Checkbox
                    checked={customer.isCompany}
                    onChange={(event) => update("isCompany", event.target.checked)}
                    label="Pedido em nome de escritório ou imobiliária"
                    description="Para o plano empresa parceira, use o cadastro de CNPJ verificado no Dashboard."
                  />
                </div>
                {customer.isCompany && (
                  <Input
                    label="Razão social"
                    required
                    value={customer.companyName || ""}
                    onChange={(event) => update("companyName", event.target.value)}
                  />
                )}
              </div>

              {needsShipping && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Endereço para certidões físicas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="CEP"
                      required
                      value={customer.shipping?.cep || ""}
                      onChange={(event) => {
                        const next = maskCep(event.target.value);
                        updateShipping("cep", next);
                        if (next.replace(/\D/g, "").length === 8) lookupCep(next);
                      }}
                      helperText={loadingCep ? "Consultando ViaCEP..." : undefined}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Logradouro"
                        required
                        value={customer.shipping?.street || ""}
                        onChange={(event) => updateShipping("street", event.target.value)}
                      />
                    </div>
                    <Input
                      label="Número"
                      required
                      value={customer.shipping?.number || ""}
                      onChange={(event) => updateShipping("number", event.target.value)}
                    />
                    <Input
                      label="Complemento"
                      value={customer.shipping?.complement || ""}
                      onChange={(event) => updateShipping("complement", event.target.value)}
                    />
                    <Input
                      label="Bairro"
                      required
                      value={customer.shipping?.district || ""}
                      onChange={(event) => updateShipping("district", event.target.value)}
                    />
                    <Input
                      label="Cidade"
                      required
                      value={customer.shipping?.city || ""}
                      onChange={(event) => updateShipping("city", event.target.value)}
                    />
                    <Input
                      label="UF"
                      required
                      value={customer.shipping?.state || ""}
                      onChange={(event) =>
                        updateShipping("state", event.target.value.toUpperCase().slice(0, 2))
                      }
                    />
                  </div>
                </div>
              )}

              {error && <Alert variant="error" title="Não foi possível continuar">{error}</Alert>}
            </form>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5">
                <RadioGroup
                  name="paymentMethod"
                  label="Forma de pagamento"
                  value={paymentMethod}
                  onChange={(value) => setPaymentMethod(value as "PIX" | "CREDIT_CARD")}
                  options={[
                    {
                      value: "PIX",
                      label: "PIX",
                      description: "QR Code e código copia e cola no Mercado Pago.",
                    },
                    {
                      value: "CREDIT_CARD",
                      label: "Cartão de crédito ou débito",
                      description: "Pague na Cartori, em até 12x. Dados do cartão ficam no Mercado Pago.",
                    },
                  ]}
                />
              </div>
              <OrderSummary
                items={items}
                itemsSubtotal={itemsSubtotal}
                shippingSubtotal={shippingSubtotal}
                total={total}
                cta={
                  paymentMethod === "PIX" ? (
                    <Button
                      type="submit"
                      form="checkout-form"
                      className="w-full"
                      size="lg"
                      isLoading={loading}
                      disabled={!profile}
                    >
                      Pagar com PIX
                    </Button>
                  ) : null
                }
              />
              {paymentMethod === "CREDIT_CARD" && profile && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Pagar com cartão</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Checkout transparente do Mercado Pago. A Cartori não vê nem guarda o número do cartão.
                    </p>
                  </div>
                  <MercadoPagoCardBrick
                    amount={total}
                    onPay={handleCardPay}
                    onError={setError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
