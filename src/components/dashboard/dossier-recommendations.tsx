"use client";

import * as React from "react";
import Link from "next/link";
import { FileStack, ShoppingCart } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/layout/card";
import { useCart } from "@/components/cart/cart-provider";
import { CertificateConfigDialog } from "@/components/storefront/certificate-config-dialog";
import { documentDataFromSubject } from "@/lib/dossier-types";
import type {
  PublicCertificateRecommendation,
  PublicSubject,
} from "@/lib/dossier-types";
import { CertificateTypeConfig } from "@/lib/types";

export function DossierRecommendations({
  protocol,
  title,
  subjects,
  recommendations,
}: {
  protocol: string;
  title: string;
  subjects: PublicSubject[];
  recommendations: PublicCertificateRecommendation[];
}) {
  const { addItem, itemCount } = useCart();
  const [selected, setSelected] = React.useState<CertificateTypeConfig | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<PublicSubject | null>(null);
  const [loadingSlug, setLoadingSlug] = React.useState("");
  const [error, setError] = React.useState("");
  const [added, setAdded] = React.useState(0);

  const openCertificate = async (row: PublicCertificateRecommendation) => {
    setError("");
    setLoadingSlug(`${row.slug}:${row.subjectId}`);
    try {
      const res = await fetch(`/api/products?slug=${encodeURIComponent(row.slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.success || !data.product) {
        setError(data.error || "Certidão não encontrada no catálogo.");
        return;
      }
      setSelectedSubject(subjects.find((subject) => subject.id === row.subjectId) || null);
      setSelected(data.product);
    } catch {
      setError("Falha ao carregar a certidão. Tente de novo.");
    } finally {
      setLoadingSlug("");
    }
  };

  if (recommendations.length === 0) {
    return (
      <Alert title="Pacote ainda sem certidão do catálogo">
        Não há SKU ativo para esta combinação de finalidade e sujeito. Nada foi inventado fora do
        catálogo.
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-brand-50 border border-brand-200 text-brand-950 flex items-center justify-center shrink-0">
              <FileStack className="w-4 h-4" aria-hidden />
            </div>
            <div className="space-y-1 min-w-0">
              <CardTitle>Pacote para solicitar</CardTitle>
              <CardDescription>
                Certidões do catálogo Cartori para esta finalidade. Não é consulta à Receita nem
                parecer jurídico — é o pedido que o escritório ou a imobiliária precisa emitir.
                Preço final sai no checkout, com UF e cartório.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {added > 0 ? (
            <Alert variant="success" title="Incluído no pedido">
              {added} item{added > 1 ? "s" : ""} no carrinho.{" "}
              <Link href="/carrinho" className="font-semibold text-brand-800 hover:text-brand-950">
                Ir ao checkout
              </Link>
              {itemCount > added ? ` · ${itemCount} no total` : ""}.
            </Alert>
          ) : null}

          <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-md overflow-hidden">
            {recommendations.map((row) => {
              const key = `${row.slug}:${row.subjectId}`;
              return (
                <li
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-neutral-0"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">{row.name}</p>
                    <p className="text-xs text-neutral-500">
                      {row.categoryName} · {row.subjectName} · {row.estimatedDays}
                    </p>
                    <p className="text-sm text-neutral-700">{row.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={loadingSlug === key}
                      leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                      onClick={() => openCertificate(row)}
                    >
                      Solicitar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {selected ? (
        <CertificateConfigDialog
          key={`${selected.slug}:${selectedSubject?.id || "none"}`}
          certificate={selected}
          initialReferenceTag={`${protocol} — ${title}`.slice(0, 80)}
          initialDocumentData={
            selectedSubject
              ? documentDataFromSubject(
                  selected.fields.map((field) => field.id),
                  selectedSubject
                )
              : undefined
          }
          onClose={() => {
            setSelected(null);
            setSelectedSubject(null);
          }}
          onAdd={(items) => {
            items.forEach(addItem);
            setAdded((count) => count + items.length);
            setSelected(null);
            setSelectedSubject(null);
          }}
        />
      ) : null}
    </>
  );
}
