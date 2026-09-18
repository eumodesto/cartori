"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type TemplateVariable = { name: string; description: string; sample: string };

type EmailTemplate = {
  key: string;
  group: "conta" | "compra" | "status" | "cancelamento" | "documentacao";
  label: string;
  description: string;
  status: string | null;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  source: "override" | "default";
};

type EmailSettings = {
  fromEmail: string;
  fromSource: "db" | "env" | "none";
  resendConfigured: boolean;
  resendMasked: string;
  resendSource: "db" | "env" | "none";
};

const GROUPS: { id: EmailTemplate["group"]; label: string }[] = [
  { id: "conta", label: "Conta" },
  { id: "compra", label: "Compra" },
  { id: "status", label: "Status do pedido" },
  { id: "cancelamento", label: "Cancelamento" },
  { id: "documentacao", label: "Documentação" },
];

export default function EmailsPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const isAdmin = profile?.role === "ADMIN";

  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
  const [settings, setSettings] = React.useState<EmailSettings | null>(null);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);

  const [group, setGroup] = React.useState<EmailTemplate["group"]>("conta");
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [savingTpl, setSavingTpl] = React.useState(false);
  const [tplMessage, setTplMessage] = React.useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const [preview, setPreview] = React.useState<{ subject: string; body: string } | null>(
    null
  );

  const [resendKey, setResendKey] = React.useState("");
  const [fromEmail, setFromEmail] = React.useState("");
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsMessage, setSettingsMessage] = React.useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  React.useEffect(() => {
    if (!loading && profile && !isAdmin) router.replace("/painel");
  }, [loading, profile, isAdmin, router]);

  const loadTemplateIntoEditor = React.useCallback((tpl: EmailTemplate) => {
    setSelectedKey(tpl.key);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setPreview(null);
    setTplMessage(null);
  }, []);

  React.useEffect(() => {
    if (!isAdmin) return;
    setFetching(true);
    Promise.all([
      fetch("/api/admin/email-templates", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/email-settings", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([tplData, setData]) => {
        if (tplData.success) {
          const list: EmailTemplate[] = tplData.templates || [];
          setTemplates(list);
          const first = list.find((t) => t.group === "conta") || list[0];
          if (first) {
            setGroup(first.group);
            loadTemplateIntoEditor(first);
          }
        } else {
          setError(tplData.error || "Não foi possível carregar os templates.");
        }
        if (setData.success) {
          setSettings(setData.settings);
          setFromEmail(setData.settings.fromEmail || "");
        }
      })
      .catch(() => setError("Falha ao carregar a configuração de e-mails."))
      .finally(() => setFetching(false));
  }, [isAdmin, loadTemplateIntoEditor]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }
  if (!isAdmin) return null;

  const groupTemplates = templates.filter((t) => t.group === group);
  const selected = templates.find((t) => t.key === selectedKey) || null;
  const dirty = selected ? subject !== selected.subject || body !== selected.body : false;

  const insertVariable = (name: string) => {
    setBody((prev) => `${prev}{{${name}}}`);
  };

  const saveTemplate = async () => {
    if (!selected) return;
    setSavingTpl(true);
    setTplMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!data.success) {
        setTplMessage({ type: "error", text: data.error || "Não foi possível salvar." });
      } else {
        setTemplates((prev) =>
          prev.map((t) => (t.key === data.template.key ? data.template : t))
        );
        setTplMessage({ type: "success", text: "Template salvo." });
      }
    } catch {
      setTplMessage({ type: "error", text: "Falha ao salvar o template." });
    } finally {
      setSavingTpl(false);
    }
  };

  const resetTemplate = async () => {
    if (!selected) return;
    setSavingTpl(true);
    setTplMessage(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && data.template) {
        setTemplates((prev) =>
          prev.map((t) => (t.key === data.template.key ? data.template : t))
        );
        setSubject(data.template.subject);
        setBody(data.template.body);
        setTplMessage({ type: "success", text: "Template restaurado para o padrão." });
      }
    } catch {
      setTplMessage({ type: "error", text: "Falha ao restaurar o template." });
    } finally {
      setSavingTpl(false);
    }
  };

  const runPreview = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.key}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (data.success && data.preview) setPreview(data.preview);
    } catch {
      setTplMessage({ type: "error", text: "Falha ao gerar a pré-visualização." });
    }
  };

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const payload: { resendApiKey?: string; fromEmail?: string } = { fromEmail };
      if (resendKey.trim()) payload.resendApiKey = resendKey.trim();
      const res = await fetch("/api/admin/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setSettingsMessage({ type: "error", text: data.error || "Não foi possível salvar." });
      } else {
        setSettings(data.settings);
        setFromEmail(data.settings.fromEmail || "");
        setResendKey("");
        setSettingsMessage({ type: "success", text: "Configuração salva." });
      }
    } catch {
      setSettingsMessage({ type: "error", text: "Falha ao salvar a configuração." });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="E-mails & Templates"
        description="Configure a integração de envio (Resend/SMTP) e edite os templates de e-mail transacionais da Cartori."
      />

      {error && <Alert variant="error">{error}</Alert>}

      {/* Integração de envio */}
      <form
        onSubmit={saveSettings}
        className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Integração de envio (Resend)</h2>
            <p className="text-xs text-neutral-500">
              Token usado para enviar os e-mails por SMTP/Resend. É armazenado no servidor e
              nunca exibido em texto puro.
            </p>
          </div>
          {settings && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                settings.resendConfigured
                  ? "bg-semantic-success-bg text-semantic-success border-semantic-success-border"
                  : "bg-semantic-warning-bg text-semantic-warning border-semantic-warning-border"
              )}
            >
              {settings.resendConfigured
                ? `Configurado (${settings.resendSource === "env" ? "env" : "painel"})`
                : "Não configurado"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Token de integração (Resend API Key)"
            type="password"
            value={resendKey}
            onChange={(e) => setResendKey(e.target.value)}
            placeholder={
              settings?.resendConfigured
                ? `Configurado: ${settings.resendMasked} — digite para substituir`
                : "re_xxxxxxxxxxxxxxxxxxxx"
            }
            helperText="Deixe em branco para manter o token atual."
          />
          <Input
            label="E-mail remetente (From)"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="Cartori <no-reply@cartori.com.br>"
          />
        </div>

        {settingsMessage && (
          <Alert variant={settingsMessage.type}>{settingsMessage.text}</Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={savingSettings} leftIcon={<Save className="w-4 h-4" />}>
            Salvar integração
          </Button>
        </div>
      </form>

      {/* Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Categorias
            </p>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroup(g.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors",
                    group === g.id
                      ? "bg-brand-950 text-neutral-0 border-brand-950"
                      : "bg-neutral-0 text-neutral-600 border-neutral-200 hover:text-neutral-900"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Templates
            </p>
            <div className="flex flex-col gap-1.5">
              {groupTemplates.map((tpl) => (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => loadTemplateIntoEditor(tpl)}
                  className={cn(
                    "text-left px-3 py-2 rounded-md border text-xs transition-colors",
                    selectedKey === tpl.key
                      ? "border-brand-300 bg-brand-50 text-brand-950"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  )}
                >
                  <span className="font-semibold block">{tpl.label}</span>
                  <span className="text-[11px] text-neutral-500">
                    {tpl.source === "override" ? "Personalizado" : "Padrão"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {selected ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">{selected.label}</h2>
                <p className="text-xs text-neutral-500">{selected.description}</p>
              </div>

              {tplMessage && <Alert variant={tplMessage.type}>{tplMessage.text}</Alert>}

              <Input
                label="Assunto"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                label="Corpo do e-mail"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                helperText="Use as variáveis abaixo no formato {{variavel}}."
              />

              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Variáveis disponíveis (clique para inserir)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.variables.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      title={v.description}
                      onClick={() => insertVariable(v.name)}
                      className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[11px] text-neutral-700 hover:border-brand-300 hover:bg-brand-50"
                    >
                      {`{{${v.name}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={runPreview}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    Pré-visualizar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetTemplate}
                    disabled={selected.source !== "override" || savingTpl}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Restaurar padrão
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={saveTemplate}
                  isLoading={savingTpl}
                  disabled={!dirty}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Salvar template
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {fetching ? "Carregando templates..." : "Selecione um template."}
            </p>
          )}

          {preview && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Pré-visualização</h3>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Fechar
                </button>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
                <p className="text-xs text-neutral-400 uppercase tracking-wide">Assunto</p>
                <p className="text-sm font-semibold text-neutral-900">{preview.subject}</p>
                <div className="my-3 h-px bg-neutral-200" />
                <p className="text-xs text-neutral-400 uppercase tracking-wide">Corpo</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-neutral-700 leading-relaxed">
                  {preview.body}
                </pre>
              </div>
              <p className="text-[11px] text-neutral-500">
                Pré-visualização com dados de exemplo. As variáveis são substituídas no envio real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
