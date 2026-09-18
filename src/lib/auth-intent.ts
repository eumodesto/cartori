export const COMPANY_SIGNUP_PATH = "/?cadastro=empresa";
export const COMPANY_DASHBOARD_PATH = "/painel?empresa=1";
export const AUTH_INTENT_EVENT = "cartori:open-auth";

export type AuthIntentKind = "default" | "company";

export type AuthIntentDetail = {
  mode: "login" | "signup";
  intent?: AuthIntentKind;
};

export const COMPANY_SAAS_BENEFITS = [
  "Pedidos em lote num único painel",
  "Gestão por processo, cliente ou imóvel",
  "Repositório digital das e-certidões",
  "Equipe na mesma conta corporativa",
  "Cobrança única por PIX ou cartão",
] as const;

export function isCompanySignupSearch(search: string | URLSearchParams) {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  return params.get("cadastro") === "empresa" || params.get("conta") === "empresa";
}

export function requestAuthIntent(detail: AuthIntentDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_INTENT_EVENT, { detail }));
}
