"use client";

import * as React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/layout/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOSSIER_STATUS_LABEL,
  purposeLabel,
  type PublicDossierSummary,
} from "@/lib/dossier-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(status: PublicDossierSummary["status"]) {
  if (status === "READY") return "success" as const;
  if (status === "PARTIAL" || status === "RUNNING") return "info" as const;
  if (status === "EXPIRED") return "warning" as const;
  return "neutral" as const;
}

export function DossierList() {
  const [dossiers, setDossiers] = React.useState<PublicDossierSummary[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/dossiers", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!data.success) {
          setError(data.error || "Não foi possível carregar os dossiês.");
          return;
        }
        setDossiers(data.dossiers || []);
      })
      .catch(() => {
        if (!cancelled) setError("Falha ao carregar os dossiês.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando dossiês...</p>;
  }

  if (error) {
    return <Alert variant="error" title="Dossiês">{error}</Alert>;
  }

  if (dossiers.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <FolderOpen className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
        <h2 className="text-lg font-serif font-bold text-neutral-900">Nenhum dossiê ainda</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Crie uma análise de pessoa, empresa ou imóvel. O dossiê monta o pacote de certidões para pedir no checkout.
        </p>
        <Link href="/dashboard/dossies/novo" className="mt-6 inline-flex">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Novo dossiê
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Protocolo</TableHead>
          <TableHead>Finalidade</TableHead>
          <TableHead>Sujeito</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dossiers.map((dossier) => (
          <TableRow key={dossier.id}>
            <TableCell>
              <Link
                href={`/dashboard/dossies/${dossier.id}`}
                className="font-mono text-xs text-brand-700 hover:text-brand-950"
              >
                {dossier.protocol}
              </Link>
            </TableCell>
            <TableCell>{purposeLabel(dossier.purpose)}</TableCell>
            <TableCell>
              {dossier.primarySubject || "—"}
              {dossier.subjectCount > 1 ? (
                <span className="text-neutral-500"> +{dossier.subjectCount - 1}</span>
              ) : null}
            </TableCell>
            <TableCell>
              <StatusBadge
                status={statusTone(dossier.status)}
                label={DOSSIER_STATUS_LABEL[dossier.status]}
              />
            </TableCell>
            <TableCell>{formatDate(dossier.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
