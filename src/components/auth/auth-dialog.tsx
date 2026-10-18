"use client";

import * as React from "react";
import { Building2, Check, LogIn, Search, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/auth-provider";
import { COMPANY_DASHBOARD_PATH, COMPANY_SAAS_BENEFITS, type AuthIntentKind } from "@/lib/auth-intent";
import type { CnpjCompany } from "@/lib/cnpj";
import { BRAZIL_UFS } from "@/lib/ibge-uf";
import {
  formatProfessionalRegistry,
  normalizeRegistryNumber,
  PROFESSIONAL_REGISTRY_LABEL,
  type ProfessionalRegistryKind,
} from "@/lib/professional-registry";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/terms";
import { digitsOnly, maskCpfCnpj, maskPhone } from "@/lib/utils";
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE } from "@/lib/validators";

const UF_OPTIONS = BRAZIL_UFS.map((uf) => ({ value: uf, label: uf }));

function AccountTypeButton({
  active,
  icon,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left text-xs transition-colors ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-950 ring-1 ring-brand-500"
          : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
      }`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>
        <span className="font-semibold block">{title}</span>
        <span className="text-[11px] text-neutral-500">{hint}</span>
      </span>
    </button>
  );
}

export function AuthDialog({
  isOpen,
  onClose,
  nextPath = "/pos-login",
  required = false,
  initialMode = "login",
  intent = "default",
  title,
  description,
  onAuthenticated,
}: {
  isOpen: boolean;
  onClose: () => void;
  nextPath?: string | null;
  required?: boolean;
  initialMode?: "login" | "signup";
  intent?: AuthIntentKind;
  title?: string;
  description?: string;
  onAuthenticated?: (result: { wantsPartner: boolean }) => void;
}) {
  const { refresh, configured } = useAuth();
  const companyIntent = intent === "company";
  const [mode, setMode] = React.useState<"login" | "signup">(initialMode);
  const [account, setAccount] = React.useState<"person" | "company">(
    companyIntent ? "company" : "person"
  );
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [cnpj, setCnpj] = React.useState("");
  const [company, setCompany] = React.useState<CnpjCompany | null>(null);
  const [cnpjError, setCnpjError] = React.useState("");
  const [cnpjLooking, setCnpjLooking] = React.useState(false);
  const [registryType, setRegistryType] = React.useState<ProfessionalRegistryKind>("OAB");
  const [registryState, setRegistryState] = React.useState("");
  const [registryNumber, setRegistryNumber] = React.useState("");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  /** Recuperação de senha: subestado do modo "Entrar". */
  const [forgot, setForgot] = React.useState(false);
  const [noticeTitle, setNoticeTitle] = React.useState("Confirme o e-mail");

  const signup = mode === "signup";
  const isCompany = signup && (companyIntent || account === "company");
  const passwordMismatch = signup && confirmPassword.length > 0 && confirmPassword !== password;

  const reset = () => {
    setError("");
    setNotice("");
    setForgot(false);
    setNoticeTitle("Confirme o e-mail");
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setAccount(companyIntent ? "company" : "person");
    reset();
  }, [isOpen, initialMode, companyIntent]);

  const lookupCompany = async (value: string) => {
    setCnpjLooking(true);
    setCnpjError("");
    try {
      const res = await fetch(`/api/cnpj/${digitsOnly(value)}`);
      const data = await res.json();
      if (!data.success) {
        setCompany(null);
        setCnpjError(data.error || "CNPJ não encontrado.");
        return;
      }
      setCompany(data.company);
      if (!data.company.active) {
        setCnpjError(`Situação cadastral: ${data.company.status}. Só empresas ativas podem ser cadastradas.`);
      }
      if (data.company.state) {
        setRegistryState((current) => current || data.company.state);
      }
    } catch {
      setCompany(null);
      setCnpjError("Não foi possível consultar o CNPJ.");
    } finally {
      setCnpjLooking(false);
    }
  };

  const finish = async (goPartner: boolean) => {
    await refresh();
    onAuthenticated?.({ wantsPartner: goPartner });
    onClose();
    const destination = goPartner ? COMPANY_DASHBOARD_PATH : nextPath;
    if (destination) {
      window.location.assign(destination);
    }
  };

  const validateSignup = (): string | null => {
    if (name.trim().split(/\s+/).length < 2) return "Informe o nome completo.";
    if (password.length < PASSWORD_MIN_LENGTH) return PASSWORD_MIN_MESSAGE;
    if (password !== confirmPassword) return "As senhas não conferem.";
    if (!acceptedTerms) return "Aceite os Termos de Uso e a Política de Privacidade.";
    if (isCompany) {
      if (!company?.active) return "Consulte um CNPJ ativo para continuar.";
      if (!formatProfessionalRegistry(registryType, registryState, registryNumber)) {
        return `Informe a UF e o número do ${registryType}.`;
      }
    }
    if (!phone) return isCompany ? "Informe o telefone da empresa." : "Informe o telefone.";
    return null;
  };

  const requestPasswordReset = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: nextPath || "/painel" }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Não foi possível enviar o link.");
        return;
      }
      setNoticeTitle("Verifique seu e-mail");
      setNotice(
        "Se houver uma conta com este e-mail, enviamos um link para criar uma nova senha. Confira também a caixa de spam."
      );
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!signup && forgot) {
      await requestPasswordReset();
      return;
    }
    if (signup) {
      const invalid = validateSignup();
      if (invalid) {
        setError(invalid);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(signup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          signup
            ? {
                accountType: isCompany ? "company" : "person",
                name,
                email,
                phone,
                password,
                confirmPassword,
                acceptedTerms,
                ...(isCompany
                  ? { cnpj: digitsOnly(cnpj), registryType, registryState, registryNumber }
                  : {}),
              }
            : { email, password }
        ),
      });
      const data = await res.json();
      if (data.needsConfirmation) {
        setNotice(
          data.message || data.error || "Confirme o e-mail antes de entrar."
        );
        setPassword("");
        setConfirmPassword("");
        return;
      }
      if (!data.success) {
        setError(data.error || "Não foi possível continuar.");
        return;
      }
      await finish(companyIntent || isCompany);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose} size={companyIntent ? "lg" : "md"}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>
            {title ||
              (companyIntent
                ? "Conta para advocacias e imobiliárias"
                : mode === "login"
                  ? forgot
                    ? "Recuperar senha"
                    : "Entrar na InterJuri"
                  : "Criar sua conta")}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (forgot && !signup
                ? "Enviaremos um link para o seu e-mail para você criar uma nova senha."
                : companyIntent
                ? "Crie a conta e siga para o dashboard empresarial. Com o CNPJ cadastrado, o escritório passa a operar no painel B2B que a InterJuri já oferece."
                : required
                  ? "Para concluir o pedido, entre ou crie uma conta. Depois do pagamento você acompanha tudo no Dashboard."
                  : "O Dashboard abre no modo pessoal. Cadastrar a empresa com CNPJ libera recursos B2B.")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogContent className="space-y-4">
            <Tabs
              variant="pill"
              fullWidth
              activeTab={mode}
              onChange={(id) => {
                setMode(id as "login" | "signup");
                setForgot(false);
                setError("");
                setNotice("");
              }}
              tabs={[
                { id: "login", label: "Entrar", icon: <LogIn className="w-4 h-4" /> },
                { id: "signup", label: "Criar conta", icon: <UserRound className="w-4 h-4" /> },
              ]}
            />

            {signup && companyIntent && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-brand-200 bg-brand-50/70 p-3">
                {COMPANY_SAAS_BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-brand-950 leading-snug">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-700" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {signup && !companyIntent && (
              <div className="grid grid-cols-2 gap-2">
                <AccountTypeButton
                  active={account === "person"}
                  onClick={() => setAccount("person")}
                  icon={<UserRound className="w-4 h-4" />}
                  title="Pessoa"
                  hint="Pedidos e downloads"
                />
                <AccountTypeButton
                  active={account === "company"}
                  onClick={() => setAccount("company")}
                  icon={<Building2 className="w-4 h-4" />}
                  title="Empresa"
                  hint="Advocacia ou imobiliária"
                />
              </div>
            )}

            {isCompany && (
              <fieldset className="space-y-3 rounded-lg border border-neutral-200 p-3">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Dados da empresa
                </legend>
                <Input
                  label="CNPJ"
                  required
                  value={cnpj}
                  inputMode="numeric"
                  placeholder="00.000.000/0001-00"
                  leftIcon={<Search className="w-4 h-4" />}
                  error={cnpjError || undefined}
                  helperText={
                    cnpjLooking
                      ? "Consultando Receita Federal..."
                      : "Consultamos a Receita Federal automaticamente."
                  }
                  onChange={(event) => {
                    const next = maskCpfCnpj(event.target.value);
                    setCnpj(next);
                    setCompany(null);
                    setCnpjError("");
                    if (digitsOnly(next).length === 14) lookupCompany(next);
                  }}
                />
                {company && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs space-y-0.5">
                    <p className="font-semibold text-neutral-900">{company.name}</p>
                    {company.tradeName && <p className="text-neutral-600">{company.tradeName}</p>}
                    <p className={company.active ? "text-emerald-700 font-medium" : "text-semantic-error font-medium"}>
                      Situação: {company.status}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-neutral-800">
                    Registro profissional <span className="text-semantic-error">*</span>
                  </p>
                  <Tabs
                    variant="pill"
                    fullWidth
                    activeTab={registryType}
                    onChange={(id) => setRegistryType(id as ProfessionalRegistryKind)}
                    tabs={[
                      { id: "OAB", label: PROFESSIONAL_REGISTRY_LABEL.OAB },
                      { id: "CRECI", label: PROFESSIONAL_REGISTRY_LABEL.CRECI },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <Select
                    label="UF"
                    required
                    value={registryState}
                    placeholder="UF"
                    options={UF_OPTIONS}
                    onChange={(event) => setRegistryState(event.target.value)}
                  />
                  <Input
                    label={`Número do ${registryType}`}
                    required
                    value={registryNumber}
                    placeholder={registryType === "OAB" ? "123456" : "12345-J"}
                    onChange={(event) => setRegistryNumber(normalizeRegistryNumber(event.target.value))}
                  />
                </div>
              </fieldset>
            )}

            {signup && (
              <Input
                label={isCompany ? "Nome completo do responsável" : "Nome completo"}
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
            <Input
              label="E-mail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {signup && (
              <Input
                label="Telefone"
                required
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(maskPhone(event.target.value))}
                placeholder="(11) 99999-0000"
              />
            )}
            {!(forgot && !signup) && (
            <div className={signup ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : undefined}>
              <div className="space-y-1.5">
                <PasswordInput
                  label="Senha"
                  required
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  helperText={signup ? `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres` : undefined}
                />
                {!signup && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgot(true);
                        setError("");
                        setNotice("");
                        setPassword("");
                      }}
                      className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>
              {signup && (
                <PasswordInput
                  label="Confirmar senha"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={passwordMismatch ? "As senhas não conferem." : undefined}
                />
              )}
            </div>
            )}
            {forgot && !signup && (
              <button
                type="button"
                onClick={() => {
                  setForgot(false);
                  setError("");
                  setNotice("");
                }}
                className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
              >
                Voltar para entrar
              </button>
            )}

            {signup && (
              <div className="flex items-start gap-2.5 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <Checkbox
                  aria-label="Aceito os Termos de Uso e a Política de Privacidade"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <p className="text-xs leading-relaxed text-neutral-700">
                  Li e aceito os{" "}
                  <a
                    href={TERMS_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-800 underline underline-offset-2 hover:text-brand-950"
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href={PRIVACY_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-800 underline underline-offset-2 hover:text-brand-950"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            )}

            {!configured && (
              <Alert variant="warning" title="Auth ainda sem chaves">
                Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente para ativar o login.
              </Alert>
            )}
            {notice && <Alert variant="info" title={noticeTitle}>{notice}</Alert>}
            {error && <Alert variant="error" title="Não foi possível continuar">{error}</Alert>}
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {required ? "Voltar" : "Cancelar"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={!configured || (signup && !acceptedTerms)}
            >
              {mode === "login"
                ? forgot
                  ? "Enviar link"
                  : "Entrar"
                : isCompany
                  ? "Criar conta e ir ao painel"
                  : "Criar conta"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
