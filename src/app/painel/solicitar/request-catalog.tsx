"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CatalogBrowser } from "@/components/storefront/catalog-browser";
import type { CertificateTypeConfig } from "@/lib/types";

export function RequestCatalog({ certificates }: { certificates: CertificateTypeConfig[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar certidão"
        description="Escolha a certidão, informe o local e os dados do documento. Depois é só revisar o pedido e pagar."
      />
      <section id="painel-catalogo" className="scroll-mt-24">
        <CatalogBrowser
          certificates={certificates}
          scrollTargetId="painel-catalogo"
          heading={{
            eyebrow: "Catálogo completo",
            title: "Selecione a certidão",
            subtitle: "Todas as certidões disponíveis para a sua conta.",
          }}
        />
      </section>
    </div>
  );
}
