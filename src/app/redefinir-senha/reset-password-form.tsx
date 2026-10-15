"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { requestAuthIntent } from "@/lib/auth-intent";
import { safeAppPath } from "@/lib/utils";
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE } from "@/lib/validators";

export function ResetPasswordForm({ next }: { next?: string }) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [expired, setExpired] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const destination = `/pos-login?next=${encodeURIComponent(safeAppPath(next, "/painel"))}`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(PASSWORD_MIN_MESSAGE);
      return;
    }
    if (mismatch) {
      setError("As senhas não conferem.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setExpired(Boolean(data.expired));
        setError(data.error || "Não foi possível salvar a nova senha.");
        return;
      }
      setDone(true);
      window.setTimeout(() => window.location.assign(destination), 1500);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Criar nova senha</h1>
        <p className="text-sm text-neutral-600">
          Escolha a nova senha (mínimo de {PASSWORD_MIN_LENGTH} caracteres). Depois de salvar, você segue para a sua conta.
        </p>
      </div>

      <PasswordInput
        label="Nova senha"
        required
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        helperText={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`}
        disabled={done}
      />
      <PasswordInput
        label="Confirmar nova senha"
        required
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={mismatch ? "As senhas não conferem." : undefined}
        disabled={done}
      />

      {done && (
        <Alert variant="success" title="Senha alterada">
          Tudo certo. Levando você para a sua conta...
        </Alert>
      )}
      {error && (
        <Alert variant="error" title="Não foi possível continuar">
          {error}
          {expired && (
            <button
              type="button"
              onClick={() => requestAuthIntent({ mode: "login" })}
              className="mt-2 block font-semibold underline underline-offset-2"
            >
              Pedir um novo link
            </button>
          )}
        </Alert>
      )}

      <Button type="submit" className="w-full" isLoading={saving} disabled={done}>
        Salvar nova senha
      </Button>
    </form>
  );
}
