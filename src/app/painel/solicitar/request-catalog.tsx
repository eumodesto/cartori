"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CatalogBrowser } from "@/components/storefront/catalog-browser";
import { Alert } from "@/components/ui/alert";
import type { CertificateTypeConfig } from "@/lib/types";

export function RequestCatalog({ certificates }: { certificates: CertificateTypeConfig[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar certidão"
        description="Escolha a certidão, informe o local e os dados do documento. Depois é só revisar o pedido e pagar."
      />
      <Alert variant="info" title="Antes de pedir">
        A InterJuri é uma empresa privada, sem vínculo com cartórios ou órgãos do governo. Fazemos o
        pedido em seu nome e acompanhamos até a entrega. Você também pode solicitar diretamente no
        cartório; o nosso valor inclui as taxas do cartório e a taxa de serviço.
      </Alert>
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
