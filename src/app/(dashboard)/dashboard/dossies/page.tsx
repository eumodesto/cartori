"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { DossierList } from "@/components/dashboard/dossier-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function DossiersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossiês"
        description="Cada dossiê vira um pacote de certidões do catálogo, amarrado à finalidade e às pessoas ou imóveis do caso. O pedido segue o checkout atual."
        actions={
          <Link href="/dashboard/dossies/novo">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Novo dossiê
            </Button>
          </Link>
        }
      />
      <DossierList />
    </div>
  );
}
