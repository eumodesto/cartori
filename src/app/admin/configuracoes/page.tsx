"use client";

import * as React from "react";
import { BarChart3, Save, Tags, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/auth/auth-provider";
import {
  EMPTY_TRACKING_CONFIG,
  TRACKING_FIELDS,
  isValidTrackingId,
  normalizeTrackingId,
  type TrackingConfig,
  type TrackingField,
} from "@/lib/tracking";
import { cn } from "@/lib/utils";

const FIELD_HELP: Record<TrackingField, { icon: React.ReactNode; where: string }> = {
  gtmId: {
    icon: <Tags className="w-4 h-4" />,
    where: "Tag Manager → Administrador → Instalar o Gerenciador de tags (ID no topo do contêiner).",
  },
  ga4Id: {
    icon: <BarChart3 className="w-4 h-4" />,
    where: "Analytics → Administrador → Fluxos de dados → Web → ID da métrica.",
  },
  adsId: {
    icon: <Target className="w-4 h-4" />,
    where: "Google Ads → Metas → Conversões → Tag do Google → ID da tag (AW-…).",
  },
};

const FIELD_ORDER: TrackingField[] = ["gtmId", "ga4Id", "adsId"];

function fieldStatus(config: TrackingConfig, field: TrackingField) {
  const value = config[field];
  if (!value) return { label: "Não configurado", tone: "muted" as const };
  if (!isValidTrackingId(field, value)) return { label: "Formato inválido", tone: "error" as const };
  if (!config.enabled) return { label: "Pausado", tone: "warning" as const };
  return { label: "Ativo no site", tone: "success" as const };
}

const toneClass = {
  muted: "bg-neutral-50 text-neutral-500 border-neutral-200",
  error: "bg-semantic-error-bg text-semantic-error border-semantic-error-border",
  warning: "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border",
  success: "bg-semantic-success-bg text-semantic-success border-semantic-success-border",
};

export default function ConfiguracoesPage() {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.role === "ADMIN";

  const [saved, setSaved] = React.useState<TrackingConfig>(EMPTY_TRACKING_CONFIG);
  const [form, setForm] = React.useState<TrackingConfig>(EMPTY_TRACKING_CONFIG);
  const [fetching, setFetching] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  React.useEffect(() => {
    if (!isAdmin) return;
    setFetching(true);
    fetch("/api/admin/tracking-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSaved(data.settings);
          setForm(data.settings);
        } else {
          setMessage({ type: "error", text: data.error || "Não foi possível carregar as tags." });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Falha ao carregar as configurações." }))
      .finally(() => setFetching(false));
  }, [isAdmin]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }
  if (!isAdmin) return null;

  const invalidField = FIELD_ORDER.find(
    (field) => form[field] && !isValidTrackingId(field, form[field])
  );
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const nothingConfigured = FIELD_ORDER.every((field) => !form[field]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (invalidField) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tracking-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "error", text: data.error || "Não foi possível salvar." });
      } else {
        setSaved(data.settings);
        setForm(data.settings);
        setMessage({
          type: "success",
          text: data.settings.enabled
            ? "Tags salvas. O site passa a carregá-las nas próximas visitas."
            : "Configuração salva. As tags estão pausadas no site.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Falha ao salvar as configurações." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Integrações da plataforma Cartori. As tags configuradas aqui são carregadas em todas as páginas do site."
      />

      <form
        onSubmit={save}
        className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Tags do Google</h2>
            <p className="text-xs text-neutral-500">
              Informe apenas os IDs. A Cartori monta o código oficial de cada tag automaticamente.
            </p>
          </div>
          <Switch
            checked={form.enabled}
            onChange={(enabled) => setForm((prev) => ({ ...prev, enabled }))}
            label={form.enabled ? "Tags ativas" : "Tags pausadas"}
            description="Pausar mantém os IDs salvos."
            disabled={fetching}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {FIELD_ORDER.map((field) => {
            const meta = TRACKING_FIELDS[field];
            const status = fieldStatus(form, field);
            const invalid = Boolean(form[field]) && !isValidTrackingId(field, form[field]);
            return (
              <div
                key={field}
                className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-800">
                    <span className="text-brand-700">{FIELD_HELP[field].icon}</span>
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      toneClass[status.tone]
                    )}
                  >
                    {status.label}
                  </span>
                </div>
                <Input
                  aria-label={`ID do ${meta.label}`}
                  value={form[field]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field]: normalizeTrackingId(e.target.value) }))
                  }
                  placeholder={meta.example}
                  disabled={fetching}
                  error={invalid ? `Formato esperado: ${meta.example}` : undefined}
                  className="font-mono"
                />
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  {FIELD_HELP[field].where}
                </p>
              </div>
            );
          })}
        </div>

        {form.gtmId && form.ga4Id && (
          <Alert variant="warning">
            Se o Google Analytics também estiver publicado dentro do Tag Manager, deixe o campo do
            Analytics vazio aqui para não contar visitas em dobro.
          </Alert>
        )}

        {form.enabled && nothingConfigured && !fetching && (
          <Alert variant="info">Ative ao menos um ID para que alguma tag seja carregada.</Alert>
        )}

        <Alert variant="info">
          Tags de outros fornecedores publicadas pelo Tag Manager (por exemplo, pixel da Meta)
          precisam ter o domínio liberado na política de segurança do site antes de funcionar.
        </Alert>

        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={saving}
            disabled={fetching || !dirty || Boolean(invalidField)}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Salvar configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
