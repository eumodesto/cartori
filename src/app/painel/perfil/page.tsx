"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/auth-provider";
import { maskCpfCnpj } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  CLIENT: "Cliente",
  OPERATOR: "Operador",
  ADMIN: "Administrador",
};

export default function PerfilPage() {
  const { profile, loading, refresh } = useAuth();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando perfil...</p>;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "error", text: data.error || "Não foi possível salvar." });
      } else {
        await refresh();
        setMessage({ type: "success", text: "Perfil atualizado com sucesso." });
      }
    } catch {
      setMessage({ type: "error", text: "Falha ao salvar o perfil." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Meu perfil"
        description="Atualize seus dados de contato. E-mail e CPF são usados como identidade e não são editáveis aqui."
      />

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            helperText="DDD + número, com 10 ou 11 dígitos."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="E-mail"
            value={profile.email}
            disabled
            helperText="Identidade de acesso — não pode ser alterada aqui."
          />
          <Input
            label="CPF"
            value={profile.cpf ? maskCpfCnpj(profile.cpf) : "—"}
            disabled
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
          <span>
            Papel de acesso:{" "}
            <strong className="text-neutral-800">
              {ROLE_LABEL[profile.role] ?? profile.role}
            </strong>
          </span>
          {profile.organization && (
            <span>
              Organização:{" "}
              <strong className="text-neutral-800">{profile.organization.name}</strong>
            </span>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={saving}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
