"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, ExternalLink, Info, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublishedTagCheck, TrackingField } from "@/lib/tracking";
import { cn } from "@/lib/utils";

type StepStatus = "ok" | "fail" | "warn" | "info";

type Step = {
  id: string;
  label: string;
  status: StepStatus;
  detail: string;
  link?: { href: string; label: string };
};

type CheckResponse =
  | {
      success: true;
      siteUrl: string;
      enabled: boolean;
      checks: Partial<Record<TrackingField, PublishedTagCheck>>;
    }
  | { success: false; siteUrl?: string; error: string };

type GoogleWindow = Window & {
  google_tag_manager?: Record<string, unknown>;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

const TEST_EVENT_NAME = "cartori_teste_tag";

const EVENT_STEP: Record<TrackingField, Omit<Step, "id" | "label">> = {
  gtmId: {
    status: "ok",
    detail: `Evento "${TEST_EVENT_NAME}" enviado ao dataLayer. Ele aparece no Tag Assistant com o modo de visualização do contêiner conectado ao site.`,
    link: { href: "https://tagassistant.google.com/", label: "Abrir Tag Assistant" },
  },
  ga4Id: {
    status: "ok",
    detail: `Evento "${TEST_EVENT_NAME}" enviado em modo de depuração. Confira em Analytics → Administrador → DebugView (aparece em segundos).`,
    link: { href: "https://analytics.google.com/", label: "Abrir Google Analytics" },
  },
  adsId: {
    status: "info",
    detail:
      "O Google Ads não tem visualização em tempo real. Confira em Metas → Conversões → Diagnóstico da tag; o status pode levar algumas horas para atualizar.",
    link: { href: "https://ads.google.com/aw/conversions", label: "Abrir Google Ads" },
  },
};

function sendTestEvent(field: TrackingField, id: string) {
  const w = window as GoogleWindow;
  if (field === "gtmId") {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: TEST_EVENT_NAME });
  } else if (field === "ga4Id") {
    w.gtag?.("event", TEST_EVENT_NAME, { send_to: id, debug_mode: true });
  }
}

function scriptPresent(field: TrackingField, id: string) {
  const selector =
    field === "gtmId" ? `script[src*="gtm.js?id=${id}"]` : `script[src*="gtag/js?id="]`;
  return Boolean(document.querySelector(selector));
}

async function waitForTag(id: string, timeoutMs = 6000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if ((window as GoogleWindow).google_tag_manager?.[id]) return true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return false;
}

async function runChecks(field: TrackingField, id: string): Promise<Step[]> {
  const steps: Step[] = [];

  let data: CheckResponse;
  try {
    const res = await fetch("/api/admin/tracking-settings/check", { cache: "no-store" });
    data = await res.json();
  } catch {
    data = { success: false, error: "Falha de conexão ao verificar o site." };
  }

  if (!data.success) {
    steps.push({ id: "site", label: "Publicada no site", status: "fail", detail: data.error });
    return steps;
  }

  const host = new URL(data.siteUrl).host;
  const published = data.checks[field];

  if (!data.enabled) {
    steps.push({
      id: "site",
      label: "Publicada no site",
      status: "warn",
      detail: `As tags estão pausadas: ${host} não carrega este ID.`,
    });
    return steps;
  }

  steps.push(
    published?.inHtml
      ? { id: "site", label: "Publicada no site", status: "ok", detail: `${host} entrega este ID nas páginas.` }
      : {
          id: "site",
          label: "Publicada no site",
          status: "fail",
          detail: `${host} ainda não entrega este ID. Se acabou de salvar, aguarde alguns segundos e teste de novo.`,
        }
  );

  steps.push(
    published && published.cspMissing.length === 0
      ? {
          id: "csp",
          label: "Política de segurança (CSP)",
          status: "ok",
          detail: "Os domínios do Google necessários estão liberados.",
        }
      : {
          id: "csp",
          label: "Política de segurança (CSP)",
          status: "fail",
          detail: `Domínios bloqueados: ${published?.cspMissing.join(", ") || "não verificado"}.`,
        }
  );

  if (!scriptPresent(field, id)) {
    steps.push({
      id: "browser",
      label: "Carregando no navegador",
      status: "warn",
      detail: "Esta página foi aberta antes de a tag ser salva. Recarregue a página e teste de novo.",
    });
    return steps;
  }

  const loaded = await waitForTag(id);
  if (!loaded) {
    steps.push({
      id: "browser",
      label: "Carregando no navegador",
      status: "fail",
      detail:
        "O Google não respondeu neste navegador. Desative bloqueadores de anúncios ou extensões de privacidade e teste de novo.",
    });
    return steps;
  }
  steps.push({
    id: "browser",
    label: "Carregando no navegador",
    status: "ok",
    detail: "A tag foi carregada e registrada pelo Google neste navegador.",
  });

  sendTestEvent(field, id);
  steps.push({ id: "event", label: "Confirmação no Google", ...EVENT_STEP[field] });
  return steps;
}

const STATUS_ICON: Record<StepStatus, React.ReactNode> = {
  ok: <CheckCircle2 className="w-4 h-4 text-semantic-success" />,
  fail: <XCircle className="w-4 h-4 text-semantic-error" />,
  warn: <CircleAlert className="w-4 h-4 text-semantic-warning" />,
  info: <Info className="w-4 h-4 text-semantic-info" />,
};

export function TrackingTester({
  field,
  savedId,
  unsaved,
}: {
  field: TrackingField;
  savedId: string;
  unsaved: boolean;
}) {
  const [running, setRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<Step[] | null>(null);

  React.useEffect(() => {
    setSteps(null);
  }, [savedId]);

  const blockedReason = !savedId
    ? "Salve um ID para testar."
    : unsaved
      ? "Salve as alterações antes de testar."
      : "";

  const run = async () => {
    setRunning(true);
    setSteps(null);
    try {
      setSteps(await runChecks(field, savedId));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-neutral-200 pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-500">
          {blockedReason || "Verifica site, navegador e envio ao Google."}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={run}
          isLoading={running}
          disabled={Boolean(blockedReason)}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          Testar
        </Button>
      </div>

      {steps && (
        <ul className="space-y-2" aria-live="polite">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">{STATUS_ICON[step.status]}</span>
              <span className="min-w-0 text-[11px] leading-relaxed text-neutral-600">
                <span
                  className={cn(
                    "block text-xs font-semibold",
                    step.status === "fail" ? "text-semantic-error" : "text-neutral-800"
                  )}
                >
                  {step.label}
                </span>
                {step.detail}
                {step.link && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex w-fit items-center gap-1 font-semibold text-brand-700 hover:underline"
                  >
                    {step.link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
