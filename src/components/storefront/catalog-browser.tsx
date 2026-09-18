"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import {
  CERTIFICATE_QUERY_KEY,
  certificateFromParam,
  certificateSlugFromLocation,
} from "@/lib/certificate-links";
import { CartItem, CertificateTypeConfig } from "@/lib/types";
import { FilterTags } from "@/components/ui/filter-tags";
import { LivingOrigamiBg } from "@/components/ui/living-origami-bg";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { SlideUpText } from "@/components/ui/slide-up-text";
import { Pagination } from "@/components/ui/pagination";
import { CertificateConfigDialog } from "@/components/storefront/certificate-config-dialog";
import { useCart } from "@/components/cart/cart-provider";

const CATALOG_PAGE_SIZE = 12;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface CatalogHeading {
  eyebrow: string;
  title: string;
  subtitle: string;
}

const DEFAULT_HEADING: CatalogHeading = {
  eyebrow: "Catálogo de Serviços",
  title: "Selecione a Certidão Desejada",
  subtitle:
    "Escolha o tipo de certidão para configurar a localização (Estado, Cidade e Cartório) e dados do documento.",
};

interface CatalogBrowserProps {
  /** Slug inicial para abrir direto um certificado (deep-link). */
  initialCertificateSlug?: string;
  /** Sincroniza a URL ao abrir/fechar o diálogo (comportamento da home). */
  deepLink?: boolean;
  /** Permite que a Amanda dispare a abertura de um certificado. */
  registerOpenHandler?: (handler: ((slug: string) => void) | null) => void;
  /** Notifica o container após adicionar itens ao pedido. */
  onAdded?: (items: CartItem[]) => void;
  /** id do elemento para onde a paginação faz scroll. */
  scrollTargetId?: string;
  /** Sobrescreve o cabeçalho padrão do catálogo. */
  heading?: Partial<CatalogHeading>;
}

export function CatalogBrowser({
  initialCertificateSlug,
  deepLink = false,
  registerOpenHandler,
  onAdded,
  scrollTargetId = "certidoes",
  heading,
}: CatalogBrowserProps) {
  const { addItem } = useCart();
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);
  const [selectedCert, setSelectedCert] = useState<CertificateTypeConfig | null>(
    () => certificateFromParam(initialCertificateSlug)
  );

  const openCertificate = useCallback(
    (raw: string) => {
      const cert = certificateFromParam(raw);
      if (!cert) return;
      setSelectedCert(cert);
      if (deepLink) {
        const next = `/certidao/${cert.slug}`;
        if (window.location.pathname !== next) {
          window.history.replaceState(null, "", next);
        }
      }
    },
    [deepLink]
  );

  const closeCertificate = useCallback(() => {
    setSelectedCert(null);
    if (
      deepLink &&
      (window.location.pathname.startsWith("/certidao/") ||
        window.location.search.includes(CERTIFICATE_QUERY_KEY) ||
        window.location.search.includes("servico="))
    ) {
      window.history.replaceState(null, "", "/");
    }
  }, [deepLink]);

  useEffect(() => {
    if (!registerOpenHandler) return;
    registerOpenHandler(openCertificate);
    return () => registerOpenHandler(null);
  }, [openCertificate, registerOpenHandler]);

  useEffect(() => {
    if (!deepLink) return;
    const fromProp = certificateFromParam(initialCertificateSlug);
    if (fromProp) {
      setSelectedCert(fromProp);
      return;
    }
    const fromLocation = certificateFromParam(
      certificateSlugFromLocation(
        window.location.pathname,
        new URL(window.location.href).searchParams
      )
    );
    if (fromLocation) setSelectedCert(fromLocation);
  }, [deepLink, initialCertificateSlug]);

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
    { id: "distribuidores-judiciais", label: "Distribuidores Judiciais" },
    { id: "rural", label: "Cadastro rural (INCRA)" },
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

  const catalogPageCount = Math.max(
    1,
    Math.ceil(filteredCertificates.length / CATALOG_PAGE_SIZE)
  );
  const currentCatalogPage = Math.min(catalogPage, catalogPageCount);
  const pagedCertificates = filteredCertificates.slice(
    (currentCatalogPage - 1) * CATALOG_PAGE_SIZE,
    currentCatalogPage * CATALOG_PAGE_SIZE
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [catalogQuery, activeCategories]);

  const goToCatalogPage = (page: number) => {
    setCatalogPage(page);
    document.getElementById(scrollTargetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const resolvedHeading = { ...DEFAULT_HEADING, ...heading };

  return (
    <>
      {selectedCert && (
        <CertificateConfigDialog
          certificate={selectedCert}
          onClose={closeCertificate}
          onAdd={(items) => {
            items.forEach(addItem);
            closeCertificate();
            onAdded?.(items);
          }}
        />
      )}

      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          {resolvedHeading.eyebrow}
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
          {resolvedHeading.title}
        </h2>
        <p className="text-sm text-slate-600">{resolvedHeading.subtitle}</p>

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

      {filteredCertificates.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-0 px-6 py-12 text-center">
          <p className="text-sm font-medium text-neutral-900">Nenhuma certidão encontrada</p>
          <p className="mt-1 text-xs text-neutral-500">
            Tente outro termo ou limpe a busca para ver o catálogo completo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedCertificates.map((cert) => (
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
                    onClick={() => openCertificate(cert.slug)}
                  >
                    Solicitar
                  </GetStartedButton>
                </div>
              </div>
            ))}
          </div>

          {catalogPageCount > 1 && (
            <Pagination
              className="mt-8"
              currentPage={currentCatalogPage}
              totalPages={catalogPageCount}
              totalItems={filteredCertificates.length}
              itemsPerPage={CATALOG_PAGE_SIZE}
              itemLabel="certidões"
              onPageChange={goToCatalogPage}
            />
          )}
        </>
      )}
    </>
  );
}
