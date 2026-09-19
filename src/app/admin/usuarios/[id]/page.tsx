"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { maskCpfCnpj } from "@/lib/utils";

type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CLIENT" | "OPERATOR" | "ADMIN";
  phone: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string; plan: string } | null;
  ordersCount: number;
  dossiersCount: number;
};

const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Cliente" },
  { value: "OPERATOR", label: "Operador (mesa operacional)" },
  { value: "ADMIN", label: "Administrador" },
];

export default function UsuarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [user, setUser] = React.useState<ManagedUser | null>(null);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<ManagedUser["role"]>("CLIENT");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const isAdmin = profile?.role === "ADMIN";
  const isSelf = profile?.id === params.id;

  React.useEffect(() => {
    if (!loading && profile && !isAdmin) {
      router.replace("/painel");
    }
  }, [loading, profile, isAdmin, router]);

  React.useEffect(() => {
    if (!isAdmin) return;
    setFetching(true);
    fetch(`/api/admin/users/${params.id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Usuário não encontrado.");
          return;
        }
        const u: ManagedUser = data.user;
        setUser(u);
        setName(u.name || "");
        setPhone(u.phone || "");
        setRole(u.role);
      })
      .catch(() => setError("Falha ao carregar o usuário."))
      .finally(() => setFetching(false));
  }, [isAdmin, params.id]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }
  if (!isAdmin) return null;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "error", text: data.error || "Não foi possível salvar." });
      } else {
        setUser(data.user);
        setMessage({ type: "success", text: "Usuário atualizado com sucesso." });
      }
    } catch {
      setMessage({ type: "error", text: "Falha ao salvar o usuário." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para usuários
      </Link>

      <PageHeader
        title={user?.name || (fetching ? "Carregando..." : "Usuário")}
        description={user?.email}
      />

      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {user && (
        <>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Pedidos</p>
              <p className="text-lg font-bold text-neutral-900">{user.ordersCount}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Dossiês</p>
              <p className="text-lg font-bold text-neutral-900">{user.dossiersCount}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">CPF</p>
              <p className="font-mono text-sm text-neutral-800">
                {user.cpf ? maskCpfCnpj(user.cpf) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Organização</p>
              <p className="text-sm text-neutral-800">{user.organization?.name || "—"}</p>
            </div>
          </div>

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
              />
            </div>

            <Select
              label="Papel de acesso"
              options={ROLE_OPTIONS}
              value={role}
              onChange={(e) => setRole(e.target.value as ManagedUser["role"])}
              disabled={isSelf}
              helperText={
                isSelf
                  ? "Você não pode alterar o próprio papel de administrador."
                  : "Operador acessa a mesa operacional. Administrador acessa a gestão de usuários."
              }
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
