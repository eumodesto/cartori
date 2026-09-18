"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle,
  Lock,
  Download,
  Users,
} from "lucide-react";
import { AmandaHeroSlot, useAmandaChatDock } from "@/components/cartori/ai-chat-widget";
import { WhisperText } from "@/components/ui/whisper-text";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { Testimonials } from "@/components/ui/testimonials-columns";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { CatalogBrowser } from "@/components/storefront/catalog-browser";
import { useBusinessSignup } from "@/components/auth/business-signup-link";

export function StorefrontHome({
  initialCertificateSlug,
}: {
  initialCertificateSlug?: string;
}) {
  const { registerProductHandler } = useAmandaChatDock();
  const { open: openBusinessSignup } = useBusinessSignup();
  const [addedNotice, setAddedNotice] = useState("");

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <StorefrontShell>
      {addedNotice && (
        <div className="bg-semantic-success-bg border-b border-semantic-success-border text-sm text-neutral-800 px-4 py-2.5 text-center">
          {addedNotice}{" "}
          <a href="/carrinho" className="font-semibold underline underline-offset-2">
            Ver pedido
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-primary-950 text-white py-16 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(240,240,240,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,240,240,0.08)_1px,transparent_1px)] bg-[size:6rem_4rem]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-25" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300">
                <Building2 className="w-3.5 h-3.5" />
                <span>Plataforma para Advocacias e imobiliárias</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight font-serif">
                <WhisperText
                  className="justify-center lg:justify-start"
                  delay={100}
                  duration={0.5}
                  x={-20}
                  y={0}
                  parts={[
                    { text: "Várias certidões. Diferentes cartórios." },
                    { text: "Um único pedido.", className: "text-amber-400", newline: true },
                  ]}
                />
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Centralize suas solicitações de Registro Civil, Imóveis, Notas e Protesto. Selecione o estado, cidade e cartório com preenchimento automático.
              </p>

              {/* Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Pedido Multi itens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Integração IBGE & Cartórios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Prazo Agilizado</span>
                </div>
              </div>
            </div>

            {/* Amanda — Agente Cartori */}
            <div className="lg:col-span-5">
              <AmandaHeroSlot className="w-full h-[420px] sm:h-[460px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Dynamic Request Section */}
      <section id="certidoes" className="scroll-mt-32 py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CatalogBrowser
            deepLink
            scrollTargetId="certidoes"
            initialCertificateSlug={initialCertificateSlug}
            registerOpenHandler={registerProductHandler}
            onAdded={(items) => {
              setAddedNotice(
                items.length === 1
                  ? `${items[0].certificateName} adicionada ao pedido.`
                  : `${items.length} certidões adicionadas ao pedido.`
              );
              window.setTimeout(() => setAddedNotice(""), 5000);
            }}
          />
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 py-16 bg-neutral-0 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Dúvidas
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Perguntas frequentes</h2>
            <p className="text-sm text-slate-600">
              O essencial para pedir, pagar e acompanhar a certidão. Precisa de mais detalhes? Fale com a Amanda ou abra{" "}
              <a href="/suporte" className="font-semibold text-primary-700 underline underline-offset-2">
                Suporte
              </a>
              .
            </p>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {[
              {
                q: "Como solicito uma certidão?",
                a: "Escolha o tipo no catálogo, informe estado, cidade e cartório (quando souber) e os dados do documento. Depois confirme o pedido e pague com PIX ou cartão.",
              },
              {
                q: "A certidão tem validade oficial?",
                a: "Sim. São documentos oficiais com validade em todo o território nacional. A via digital sai como e-certidão com assinatura ICP-Brasil; a via em papel é enviada pelos Correios.",
              },
              {
                q: "Como acompanho o status e as mensagens?",
                a: "Com a conta, abra Minha conta no Dashboard. Lá ficam o status da solicitação, recados da equipe e o envio de documentos.",
              },
              {
                q: "E se eu não souber o cartório?",
                a: "Sinalize no formulário que não conhece a serventia. A equipe Cartori faz a busca operacional e segue a emissão.",
              },
            ].map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section for Lawyers & Real Estate */}
      <section id="como-funciona" className="scroll-mt-32 py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Solução B2B Corporativa
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-serif">
                Desenvolvido para Escritórios de Advocacia e Imobiliárias
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Agilize due diligences, inventários, ações judiciais e transações imobiliárias. Solicite dezenas de certidões em lote, vincule ao número do processo ou imóvel e faça o download em um só repositório.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Gestão por Processo / Imóvel</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Etiquete cada certidão com o código interno do seu cliente para facilitar a prestação de contas.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Repositório Digital Central</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Todas as e-certidões emitidas ficam salvas permanentemente no painel do seu escritório.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Pagamento Seguro Mercado Pago</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gere cobrança única por PIX ou Cartão para todas as certidões solicitadas.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Múltiplos Usuários</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Advogados associados, estagiários e corretores solicitam dentro da mesma conta corporativa.
                  </p>
                </div>
              </div>

              <GetStartedButton
                size="md"
                className="bg-amber-400 hover:bg-amber-300 text-brand-950 border-transparent shadow-xs"
                iconClassName="bg-brand-950/15 text-brand-950"
                onClick={openBusinessSignup}
              >
                Criar conta empresarial
              </GetStartedButton>
            </div>

            <div className="lg:col-span-5 min-h-[420px]">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-amber-400/90">
                Quem opera com a Cartori
              </p>
              <Testimonials />
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
