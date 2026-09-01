"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MVP_CERTIFICATES, getCertificateBySlug } from "@/lib/catalog";
import { CertificateTypeConfig } from "@/lib/types";
import {
  Building2,
  CheckCircle,
  Clock,
  Lock,
  Download,
  Users,
} from "lucide-react";
import { AmandaHeroSlot, useAmandaChatDock } from "@/components/cartori/ai-chat-widget";
import { FilterTags } from "@/components/ui/filter-tags";
import { WhisperText } from "@/components/ui/whisper-text";
import { LivingOrigamiBg } from "@/components/ui/living-origami-bg";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { SlideUpText } from "@/components/ui/slide-up-text";
import { Testimonials } from "@/components/ui/testimonials-columns";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { CertificateConfigDialog } from "@/components/storefront/certificate-config-dialog";
import { useCart } from "@/components/cart/cart-provider";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default function HomePage() {
  const { registerProductHandler } = useAmandaChatDock();
  const { addItem } = useCart();
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [catalogQuery, setCatalogQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<CertificateTypeConfig | null>(null);
  const [addedNotice, setAddedNotice] = useState("");

  const handleSelectProduct = useCallback((slug: string) => {
    const cert = getCertificateBySlug(slug);
    if (!cert) return;
    setSelectedCert(cert);
    requestAnimationFrame(() => {
      document.getElementById("certidoes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  useEffect(() => {
    registerProductHandler(handleSelectProduct);
    return () => registerProductHandler(null);
  }, [handleSelectProduct, registerProductHandler]);

  const searchedCertificates = useMemo(() => {
    const needle = normalizeSearch(catalogQuery);
    if (!needle) return MVP_CERTIFICATES;
    return MVP_CERTIFICATES.filter((cert) => {
      const haystack = normalizeSearch(
        [cert.name, cert.shortDescription, cert.categoryName, cert.slug].join(" ")
      );
      return haystack.includes(needle);
    });
  }, [catalogQuery]);

  const categoryFilters = [
    { id: "all", label: "Todas as Certidões" },
    { id: "registro-civil", label: "Registro Civil" },
    { id: "notas", label: "Tabelionato de Notas" },
    { id: "imoveis", label: "Registro de Imóveis" },
    { id: "protesto", label: "Protesto de Títulos" },
  ].map((filter) => ({
    ...filter,
    count:
      filter.id === "all"
        ? searchedCertificates.length
        : searchedCertificates.filter((cert) => cert.category === filter.id).length,
  }));

  const filteredCertificates = searchedCertificates.filter((cert) => {
    if (activeCategories.size === 0) return true;
    return activeCategories.has(cert.category);
  });

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
      <section id="certidoes" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Catálogo de Serviços
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
              Selecione a Certidão Desejada
            </h2>
            <p className="text-sm text-slate-600">
              Escolha o tipo de certidão para configurar a localização (Estado, Cidade e Cartório) e dados do documento.
            </p>

            <FilterTags
              className="pt-4"
              items={categoryFilters}
              active={activeCategories}
              onChange={setActiveCategories}
              query={catalogQuery}
              onQueryChange={setCatalogQuery}
              searchPlaceholder="Buscar por nome, tipo ou cartório..."
            />
          </div>

          {/* Certificate Cards Grid */}
          {filteredCertificates.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-0 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">Nenhuma certidão encontrada</p>
              <p className="mt-1 text-xs text-neutral-500">
                Tente outro termo ou limpe a busca para ver o catálogo completo.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="relative overflow-hidden rounded-2xl border border-white/15 p-6 shadow-sm hover:shadow-lg hover:border-amber-400/40 transition-all flex flex-col justify-between group"
              >
                <LivingOrigamiBg seed={cert.id} birdCount={7} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white px-2.5 py-1 rounded-md border border-white/20">
                      {cert.categoryName}
                    </span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      {cert.estimatedDays}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-serif">
                      <SlideUpText
                        split="characters"
                        stagger={0.03}
                        inView
                        once
                        className="text-lg font-bold font-serif"
                      >
                        {cert.name}
                      </SlideUpText>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {cert.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-end">
                  <GetStartedButton
                    size="sm"
                    className="bg-amber-400 hover:bg-amber-300 text-brand-950 border-transparent shadow-xs"
                    iconClassName="bg-brand-950/15 text-brand-950"
                    onClick={() => setSelectedCert(cert)}
                  >
                    Solicitar
                  </GetStartedButton>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {selectedCert && (
        <CertificateConfigDialog
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          onAdd={(item) => {
            addItem(item);
            setSelectedCert(null);
            setAddedNotice(`${item.certificateName} adicionada ao pedido.`);
            window.setTimeout(() => setAddedNotice(""), 5000);
          }}
        />
      )}

      {/* B2B Section for Lawyers & Real Estate */}
      <section id="b2b" className="py-20 bg-primary-950 text-white relative overflow-hidden">
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
