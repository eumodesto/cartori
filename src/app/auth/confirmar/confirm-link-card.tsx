"use client";

import * as React from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const COPY: Record<string, { title: string; text: string; action: string }> = {
  signup: {
    title: "Confirmar seu cadastro",
    text: "Falta um clique para ativar a sua conta na InterJuri.",
    action: "Confirmar e entrar",
  },
  magiclink: {
    title: "Confirmar seu cadastro",
    text: "Falta um clique para ativar a sua conta na InterJuri.",
    action: "Confirmar e entrar",
  },
  recovery: {
    title: "Redefinir sua senha",
    text: "Confirme para seguir e criar uma nova senha.",
    action: "Continuar",
  },
  email_change: {
    title: "Confirmar novo e-mail",
    text: "Confirme para que este passe a ser o e-mail da sua conta.",
    action: "Confirmar novo e-mail",
  },
};

/** O token só é usado no clique (POST), não quando um robô de antivírus abre o link. */
export function ConfirmLinkCard({ tokenHash, type, next }: { tokenHash: string; type: string; next: string }) {
  const copy = COPY[type];
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(copy && tokenHash ? "" : "Link inválido. Peça um novo.");

  const confirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_hash: tokenHash, type, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setError(data.error || "Não foi possível confirmar. Peça um novo link.");
        return;
      }
      window.location.assign(data.redirect || "/painel");
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 space-y-4">
      <h1 className="text-2xl font-serif font-bold text-neutral-900">{copy?.title ?? "Confirmar acesso"}</h1>
      {copy && <p className="text-sm text-neutral-600">{copy.text}</p>}
      {error && <Alert variant="error">{error}</Alert>}
      {copy && tokenHash ? (
        <Button className="w-full" onClick={confirm} isLoading={loading}>
          {copy.action}
        </Button>
      ) : null}
      <p className="text-xs text-neutral-500">
        Link expirado?{" "}
        <Link href="/?entrar=1" className="font-semibold text-brand-800 hover:underline">
          Entre ou peça um novo
        </Link>
        .
      </p>
    </div>
  );
}
