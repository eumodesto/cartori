"use client";

import { DossierCreateForm } from "@/components/dashboard/dossier-create-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewDossierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo dossiê"
        description="Informe a finalidade e quem entra no caso. Em seguida o dossiê monta o pacote de certidões para solicitar."
      />
      <DossierCreateForm />
    </div>
  );
}
