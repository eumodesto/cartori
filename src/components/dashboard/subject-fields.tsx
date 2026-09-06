"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/layout/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  IDENTIFIER_KINDS,
  SUBJECT_KINDS,
  defaultIdentifierKind,
  identifierHelper,
  identifierKindLabel,
  identifierPlaceholder,
  type IdentifierKind,
  type SubjectKind,
} from "@/lib/dossier-types";
import { maskCpfCnpj } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export type SubjectDraft = {
  kind: SubjectKind;
  displayName: string;
  notes: string;
  identifiers: { kind: IdentifierKind; value: string }[];
};

export function emptySubject(): SubjectDraft {
  return {
    kind: "PERSON",
    displayName: "",
    notes: "",
    identifiers: [{ kind: "CPF", value: "" }],
  };
}

function formatIdentifierValue(kind: IdentifierKind, value: string) {
  if (kind === "CPF" || kind === "CNPJ") return maskCpfCnpj(value);
  return value;
}

function identifierMaxLength(kind: IdentifierKind) {
  if (kind === "CPF") return 14;
  if (kind === "CNPJ") return 18;
  return undefined;
}

function IdentifierValueInput({
  kind,
  value,
  required,
  error,
  onChange,
}: {
  kind: IdentifierKind;
  value: string;
  required?: boolean;
  error?: string;
  onChange: (next: string) => void;
}) {
  return (
    <Input
      label={identifierKindLabel(kind)}
      required={required}
      value={formatIdentifierValue(kind, value)}
      onChange={(event) => {
        const next = event.target.value;
        onChange(kind === "CPF" || kind === "CNPJ" ? maskCpfCnpj(next) : next);
      }}
      placeholder={identifierPlaceholder(kind)}
      helperText={error ? undefined : identifierHelper(kind)}
      error={error}
      maxLength={identifierMaxLength(kind)}
      inputMode={kind === "CPF" || kind === "CNPJ" || kind === "NIRF" ? "numeric" : "text"}
      autoComplete="off"
    />
  );
}

function isNameError(message?: string) {
  return Boolean(message && /nome do sujeito/i.test(message));
}

export function SubjectFields({
  value,
  onChange,
  onRemove,
  removable,
  error,
}: {
  value: SubjectDraft;
  onChange: (next: SubjectDraft) => void;
  onRemove?: () => void;
  removable?: boolean;
  error?: string;
}) {
  const primary = value.identifiers[0] ?? {
    kind: defaultIdentifierKind(value.kind),
    value: "",
  };
  const extras = value.identifiers.slice(1);
  const nameError = isNameError(error) ? error : undefined;
  const identifierError = error && !nameError ? error : undefined;

  const setKind = (kind: SubjectKind) => {
    onChange({
      ...value,
      kind,
      identifiers: [{ kind: defaultIdentifierKind(kind), value: "" }],
    });
  };

  const setIdentifiers = (identifiers: SubjectDraft["identifiers"]) => {
    onChange({ ...value, identifiers });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Sujeito</CardTitle>
          <CardDescription>
            Pessoa, empresa, imóvel ou processo analisado neste dossiê.
          </CardDescription>
        </div>
        {removable && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-neutral-950 dark:hover:bg-white/10 transition-colors"
            aria-label="Remover sujeito"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tipo"
            required
            value={value.kind}
            onChange={(event) => setKind(event.target.value as SubjectKind)}
            options={SUBJECT_KINDS}
          />
          <Input
            label="Nome"
            required
            value={value.displayName}
            onChange={(event) => onChange({ ...value, displayName: event.target.value })}
            placeholder="Nome da pessoa, empresa ou imóvel"
            error={nameError}
          />
          <div className="sm:col-span-2">
            <IdentifierValueInput
              kind={primary.kind}
              value={primary.value}
              required
              error={identifierError}
              onChange={(next) =>
                setIdentifiers([{ kind: primary.kind, value: next }, ...extras])
              }
            />
          </div>
        </div>

        {extras.map((identifier, index) => (
          <div key={`${identifier.kind}-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <Select
              label="Outro identificador"
              value={identifier.kind}
              onChange={(event) => {
                const kind = event.target.value as IdentifierKind;
                setIdentifiers([
                  primary,
                  ...extras.map((row, rowIndex) =>
                    rowIndex === index ? { kind, value: row.value } : row
                  ),
                ]);
              }}
              options={IDENTIFIER_KINDS}
            />
            <IdentifierValueInput
              kind={identifier.kind}
              value={identifier.value}
              onChange={(next) =>
                setIdentifiers([
                  primary,
                  ...extras.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, value: next } : row
                  ),
                ])
              }
            />
            <button
              type="button"
              onClick={() =>
                setIdentifiers([
                  primary,
                  ...extras.filter((_, rowIndex) => rowIndex !== index),
                ])
              }
              className="mb-0.5 p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-neutral-950 dark:hover:bg-white/10 transition-colors"
              aria-label="Remover identificador"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() =>
            setIdentifiers([...value.identifiers, { kind: "OTHER", value: "" }])
          }
        >
          Outro identificador
        </Button>

        <Textarea
          label="Notas (opcional)"
          value={value.notes}
          onChange={(event) => onChange({ ...value, notes: event.target.value })}
          rows={2}
        />
      </CardContent>
    </Card>
  );
}
