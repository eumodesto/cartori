"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { parseSubjectInput, parseSubjectsInput } from "@/lib/dossier-parse";
import { DOSSIER_PURPOSES } from "@/lib/dossier-types";

function subjectPayload(subject: SubjectDraft) {
  return {
    kind: subject.kind,
    displayName: subject.displayName,
    notes: subject.notes,
    identifiers: subject.identifiers.filter((row) => row.value.trim()),
  };
}

export function DossierCreateForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [purpose, setPurpose] = React.useState("COMPRA_IMOVEL");
  const [purposeNote, setPurposeNote] = React.useState("");
  const [subjects, setSubjects] = React.useState<SubjectDraft[]>([emptySubject()]);
  const [subjectErrors, setSubjectErrors] = React.useState<Record<number, string>>({});
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const payload = subjects.map(subjectPayload);
    const nextErrors: Record<number, string> = {};
    payload.forEach((subject, index) => {
      const parsed = parseSubjectInput(subject);
      if (typeof parsed === "string") nextErrors[index] = parsed;
    });
    if (Object.keys(nextErrors).length > 0) {
      setSubjectErrors(nextErrors);
      setError(Object.values(nextErrors)[0]);
      setLoading(false);
      return;
    }
    setSubjectErrors({});
    const parsed = parseSubjectsInput(payload);
    if (typeof parsed === "string") {
      setError(parsed);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          purpose,
          purposeNote,
          subjects: payload,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Não foi possível criar o dossiê.");
        return;
      }
      router.push(`/dashboard/dossies/${data.dossier.id}`);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do dossiê</CardTitle>
          <CardDescription>
            Título livre e a finalidade da análise. O protocolo é gerado no servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Título (opcional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Compra do imóvel na Rua das Flores"
            />
            <Select
              label="Finalidade"
              required
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              options={DOSSIER_PURPOSES}
            />
          </div>
          {purpose === "OUTRO" ? (
            <Textarea
              label="Descreva a finalidade"
              required
              value={purposeNote}
              onChange={(event) => setPurposeNote(event.target.value)}
              rows={3}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <SubjectFields
            key={index}
            value={subject}
            error={subjectErrors[index]}
            removable={subjects.length > 1}
            onRemove={() => {
              setSubjects(subjects.filter((_, row) => row !== index));
              setSubjectErrors({});
            }}
            onChange={(next) => {
              setSubjects(subjects.map((row, rowIndex) => (rowIndex === index ? next : row)));
              if (subjectErrors[index]) {
                setSubjectErrors((prev) => {
                  const copy = { ...prev };
                  delete copy[index];
                  return copy;
                });
              }
            }}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setSubjects([...subjects, emptySubject()])}
        >
          Outro sujeito
        </Button>
      </div>

      {error ? <Alert variant="error" title="Não foi possível criar">{error}</Alert> : null}

      <div className="flex items-center gap-2.5">
        <Button type="submit" variant="primary" isLoading={loading}>
          Criar dossiê
        </Button>
      </div>
    </form>
  );
}
