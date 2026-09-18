"use client";

import { DossierDetail } from "@/components/dashboard/dossier-detail";
import { PageHeader } from "@/components/layout/page-header";

export default function DossierDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossiê"
        description="Pacote de certidões do catálogo para este caso. Solicite pelo checkout; consultas a fontes públicas entram depois."
      />
      <DossierDetail dossierId={params.id} />
    </div>
  );
}
