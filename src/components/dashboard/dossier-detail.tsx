"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/layout/card";
import {
  SubjectFields,
  emptySubject,
  type SubjectDraft,
} from "@/components/dashboard/subject-fields";
import { DossierRecommendations } from "@/components/dashboard/dossier-recommendations";
import { parseSubjectInput } from "@/lib/dossier-parse";
import {
  DOSSIER_STATUS_LABEL,
  identifierKindLabel,
  purposeLabel,
  subjectKindLabel,
  type PublicCertificateRecommendation,
  type PublicDossier,
} from "@/lib/dossier-types";
import { maskCpfCnpj } from "@/lib/utils";

function displayIdentifier(kind: string, value: string) {
  if (kind === "CPF" || kind === "CNPJ") return maskCpfCnpj(value);
  return value;
}

function statusTone(status: PublicDossier["status"]) {
  if (status === "READY") return "success" as const;
  if (status === "PARTIAL" || status === "RUNNING") return "info" as const;
  if (status === "EXPIRED") return "warning" as const;
  return "neutral" as const;
}

export function DossierDetail({ dossierId }: { dossierId: string }) {
  const [dossier, setDossier] = React.useState<PublicDossier | null>(null);
  const [recommendations, setRecommendations] = React.useState<
    PublicCertificateRecommendation[]
  >([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<SubjectDraft>(emptySubject());
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [fieldError, setFieldError] = React.useState("");

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/dossiers/${dossierId}`, { cache: "no-store" });
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Dossiê não encontrado.");
      setDossier(null);
      return;
    }
    setDossier(data.dossier);
    setRecommendations(data.recommendations || []);
  }, [dossierId]);

  React.useEffect(() => {
    load()
      .catch(() => setError("Falha ao carregar o dossiê."))
      .finally(() => setLoading(false));
  }, [load]);

  const addSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldError("");
    const payload = {
      kind: draft.kind,
      displayName: draft.displayName,
      notes: draft.notes,
      identifiers: draft.identifiers.filter((row) => row.value.trim()),
    };
    const parsed = parseSubjectInput(payload);
    if (typeof parsed === "string") {
      setFieldError(parsed);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/dossiers/${dossierId}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Não foi possível incluir o sujeito.");
        return;
      }
      setDossier(data.dossier);
      setRecommendations(data.recommendations || []);
      setDraft(emptySubject());
    } catch {
      setFormError("Falha de conexão. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-neutral-500">Carregando dossiê...</p>;
  if (error || !dossier) {
    return <Alert variant="error" title="Dossiê">{error || "Dossiê não encontrado."}</Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          status={statusTone(dossier.status)}
          label={DOSSIER_STATUS_LABEL[dossier.status]}
        />
        <span className="font-mono text-xs text-neutral-500">{dossier.protocol}</span>
      </div>
      <p className="text-sm text-neutral-600">
        Finalidade: {purposeLabel(dossier.purpose)}
        {dossier.purposeNote ? ` — ${dossier.purposeNote}` : ""}.
      </p>

      <DossierRecommendations
        protocol={dossier.protocol}
        title={dossier.title}
        subjects={dossier.subjects}
        recommendations={recommendations}
      />

      <div className="space-y-3">
        {dossier.subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle>{subject.displayName}</CardTitle>
              <CardDescription>{subjectKindLabel(subject.kind)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-neutral-700 space-y-1">
                {subject.identifiers.map((identifier) => (
                  <li key={identifier.id}>
                    {identifierKindLabel(identifier.kind)}:{" "}
                    <span className="font-mono text-xs">
                      {displayIdentifier(identifier.kind, identifier.value)}
                    </span>
                  </li>
                ))}
              </ul>
              {subject.notes ? (
                <p className="text-xs text-neutral-500">{subject.notes}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={addSubject} className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">Incluir sujeito</h2>
        <SubjectFields
          value={draft}
          error={fieldError || undefined}
          onChange={(next) => {
            setDraft(next);
            if (fieldError) setFieldError("");
          }}
        />
        {formError ? <Alert variant="error">{formError}</Alert> : null}
        <Button type="submit" variant="primary" isLoading={saving}>
          Adicionar sujeito
        </Button>
      </form>
    </div>
  );
}
