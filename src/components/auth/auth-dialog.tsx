"use client";

import * as React from "react";
import { Building2, LogIn, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/auth-provider";
import { maskPhone } from "@/lib/utils";

export function AuthDialog({
  isOpen,
  onClose,
  nextPath = "/dashboard",
  required = false,
  initialMode = "login",
  title,
  description,
  onAuthenticated,
}: {
  isOpen: boolean;
  onClose: () => void;
  nextPath?: string | null;
  required?: boolean;
  initialMode?: "login" | "signup";
  title?: string;
  description?: string;
  onAuthenticated?: (result: { wantsPartner: boolean }) => void;
}) {
  const { refresh, configured } = useAuth();
  const [mode, setMode] = React.useState<"login" | "signup">(initialMode);
  const [account, setAccount] = React.useState<"person" | "company">("person");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const reset = () => {
    setError("");
    setPassword("");
  };

  React.useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    reset();
  }, [isOpen, initialMode]);

  const finish = async (goPartner: boolean) => {
    await refresh();
    onAuthenticated?.({ wantsPartner: goPartner });
    onClose();
    const destination = goPartner
      ? nextPath
        ? "/dashboard?empresa=1"
        : null
      : nextPath;
    if (destination) {
      window.location.assign(destination);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Não foi possível continuar.");
        return;
      }
      if (data.needsConfirmation) {
        setError(data.error || "Confirme o e-mail para entrar.");
        return;
      }
      await finish(mode === "signup" && account === "company");
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog isOpen={isOpen} onClose={required ? () => undefined : onClose} size="md">
        <DialogHeader onClose={required ? undefined : onClose}>
          <DialogTitle>
            {title || (mode === "login" ? "Entrar na Cartori" : "Criar sua conta")}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (required
                ? "Para concluir o pedido, entre ou crie uma conta. Depois do pagamento você acompanha tudo no Dashboard."
                : "O Dashboard abre no modo pessoal. Cadastrar a empresa com CNPJ libera recursos B2B.")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <DialogContent className="space-y-4">
            <Tabs
              variant="pill"
              activeTab={mode}
              onChange={(id) => setMode(id as "login" | "signup")}
              tabs={[
                { id: "login", label: "Entrar", icon: <LogIn className="w-3.5 h-3.5" /> },
                { id: "signup", label: "Criar conta", icon: <UserRound className="w-3.5 h-3.5" /> },
              ]}
            />

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccount("person")}
                  className={`rounded-md border px-3 py-2 text-left text-xs ${
                    account === "person"
                      ? "border-brand-500 bg-brand-50 text-brand-950"
                      : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  <UserRound className="w-4 h-4 mb-1" />
                  <span className="font-semibold block">Pessoa</span>
                  <span className="text-[11px] text-neutral-500">Pedidos e downloads</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccount("company")}
                  className={`rounded-md border px-3 py-2 text-left text-xs ${
                    account === "company"
                      ? "border-brand-500 bg-brand-50 text-brand-950"
                      : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span className="font-semibold block">Empresa</span>
                  <span className="text-[11px] text-neutral-500">CNPJ verificado</span>
                </button>
              </div>
            )}

            {mode === "signup" && (
              <Input
                label="Nome completo"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
            <Input
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {mode === "signup" && (
              <Input
                label="Telefone"
                value={phone}
                onChange={(event) => setPhone(maskPhone(event.target.value))}
                placeholder="(11) 99999-0000"
              />
            )}
            <Input
              label="Senha"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              helperText="Mínimo de 8 caracteres"
            />

            {!configured && (
              <Alert variant="warning" title="Auth ainda sem chaves">
                Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente para ativar o login.
              </Alert>
            )}
            {error && <Alert variant="error" title="Não foi possível continuar">{error}</Alert>}
          </DialogContent>
          <DialogFooter>
            {!required && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={loading} disabled={!configured}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
