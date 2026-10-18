"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FolderOpen, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BulkActionBar,
  CategoryChips,
  ListToolbar,
  RowCheckbox,
  SelectAllCheckbox,
  useRowSelection,
} from "@/components/ui/data-list";
import { Select } from "@/components/ui/select";
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
import { downloadCsv, formatCsvDate, toCsv } from "@/lib/csv";
import {
  DOSSIER_PURPOSES,
  DOSSIER_STATUS_LABEL,
  purposeLabel,
  type PublicDossierSummary,
} from "@/lib/dossier-types";
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";

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
  const [status, setStatus] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const selection = useRowSelection(dossiers);

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
        <Link href="/painel/dossies/novo" className="mt-6 inline-flex">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Novo dossiê
          </Button>
        </Link>
      </Card>
    );
  }

  const visible = dossiers.filter((dossier) => {
    if (status && dossier.status !== status) return false;
    if (purpose && dossier.purpose !== purpose) return false;
    if (!inPeriod(dossier.createdAt, period)) return false;
    return matchesSearch(query, [dossier.protocol, dossier.primarySubject, purposeLabel(dossier.purpose)]);
  });

  const statuses = Object.keys(DOSSIER_STATUS_LABEL) as Array<PublicDossierSummary["status"]>;

  const exportCsv = (rows: PublicDossierSummary[]) =>
    downloadCsv(
      "dossies",
      toCsv(
        ["Protocolo", "Finalidade", "Sujeito", "Sujeitos", "Status", "Criado"],
        rows.map((dossier) => [
          dossier.protocol,
          purposeLabel(dossier.purpose),
          dossier.primarySubject,
          dossier.subjectCount,
          DOSSIER_STATUS_LABEL[dossier.status],
          formatCsvDate(dossier.createdAt),
        ])
      )
    );

  return (
    <div className="space-y-4">
    <CategoryChips
      total={dossiers.length}
      value={status}
      onChange={setStatus}
      items={statuses
        .map((value) => ({
          id: value,
          label: DOSSIER_STATUS_LABEL[value],
          count: dossiers.filter((dossier) => dossier.status === value).length,
        }))
        .filter((chip) => chip.count > 0)}
    />
    <ListToolbar
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="Protocolo, sujeito ou finalidade"
      shown={visible.length}
      total={dossiers.length}
      onReset={() => {
        setStatus("");
        setQuery("");
        setPurpose("");
        setPeriod("");
      }}
      actions={
        <Button variant="outline" size="md" onClick={() => exportCsv(visible)} disabled={!visible.length}>
          <Download className="w-4 h-4" aria-hidden />
          Exportar lista
        </Button>
      }
    >
      <Select
        aria-label="Finalidade"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        options={[{ value: "", label: "Todas as finalidades" }, ...DOSSIER_PURPOSES]}
      />
      <Select aria-label="Data de criação" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
    </ListToolbar>
    <BulkActionBar count={selection.count} onClear={selection.clear}>
      <Button size="sm" variant="outline" onClick={() => exportCsv(selection.selectedRows)}>
        <Download className="w-4 h-4" aria-hidden />
        Exportar CSV
      </Button>
    </BulkActionBar>
    {visible.length === 0 ? (
      <p className="text-sm text-neutral-500">Nenhum dossiê com esses filtros.</p>
    ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <SelectAllCheckbox
              checked={selection.allSelected(visible)}
              onChange={() => selection.toggleAll(visible)}
            />
          </TableHead>
          <TableHead>Protocolo</TableHead>
          <TableHead>Finalidade</TableHead>
          <TableHead>Sujeito</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visible.map((dossier) => (
          <TableRow key={dossier.id} isSelected={selection.isSelected(dossier.id)}>
            <TableCell>
              <RowCheckbox
                label={`Selecionar dossiê ${dossier.protocol}`}
                checked={selection.isSelected(dossier.id)}
                onChange={() => selection.toggle(dossier.id)}
              />
            </TableCell>
            <TableCell>
              <Link
                href={`/painel/dossies/${dossier.id}`}
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
    )}
    </div>
  );
}
