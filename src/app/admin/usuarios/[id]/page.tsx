"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AccessLevelFields } from "@/components/admin/access-level-fields";
import { UserOrders } from "@/components/admin/user-orders";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hasFullAdminAccess } from "@/lib/admin-permissions";
import { formatLoginDate, isOnline, timeAgo } from "@/lib/presence-rules";
import { maskCpfCnpj } from "@/lib/utils";

type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CLIENT" | "OPERATOR" | "ADMIN";
  staffPermissions: string[];
  phone: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  organization: { id: string; name: string; plan: string } | null;
  ordersCount: number;
  dossiersCount: number;
};

export default function UsuarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = useAuth();
  const router = useRouter();
  const [user, setUser] = React.useState<ManagedUser | null>(null);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<ManagedUser["role"]>("CLIENT");
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const isSelf = profile?.id === params.id;
  const actorFull = profile ? hasFullAdminAccess(profile.role, profile.staffPermissions ?? []) : false;
  // Administrador restrito não altera administradores; ninguém altera o próprio nível.
  const accessLocked = isSelf || (user?.role === "ADMIN" && !actorFull);
  const accessLockReason = isSelf
    ? "Você não pode alterar o próprio nível de acesso. Peça a outro administrador."
    : accessLocked
      ? "Só um administrador com acesso total altera administradores."
      : undefined;

  React.useEffect(() => {
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
        setPermissions(u.staffPermissions || []);
      })
      .catch(() => setError("Falha ao carregar o usuário."))
      .finally(() => setFetching(false));
  }, [params.id]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accessLocked ? { name, phone } : { name, phone, role, staffPermissions: permissions }
        ),
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
    <div className="space-y-6">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para usuários
      </Link>

      <PageHeader
        title={user?.name || (fetching ? "Carregando..." : "Usuário")}
        description={
          user
            ? `${user.email} · ${
                isOnline(user.lastSeenAt)
                  ? "Online agora"
                  : user.lastLoginAt
                    ? `último login em ${formatLoginDate(user.lastLoginAt)}${user.lastSeenAt ? ` · visto ${timeAgo(user.lastSeenAt)}` : ""}`
                    : "nunca entrou"
              }`
            : undefined
        }
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

            <AccessLevelFields
              role={role}
              permissions={permissions}
              onChange={(next) => {
                setRole(next.role);
                setPermissions(next.permissions);
              }}
              canManageAdmins={actorFull}
              disabled={accessLocked}
              disabledReason={accessLockReason}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>

          <UserOrders userId={user.id} />

          {!isSelf && (
            <section className="rounded-2xl border border-semantic-error-border bg-semantic-error-bg/40 p-6 space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900">Excluir conta</h2>
              <p className="text-sm text-neutral-700">
                Remove o login e o cadastro. Os pedidos ({user.ordersCount}) ficam guardados para registro
                fiscal e voltam a aparecer se a pessoa criar conta de novo com o mesmo e-mail. Dossiês são
                apagados.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={user.role === "ADMIN" && !actorFull}
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                Excluir conta
              </Button>
            </section>
          )}

          <Dialog
            isOpen={deleteOpen}
            onClose={() => {
              if (deleting) return;
              setDeleteOpen(false);
              setDeleteConfirm("");
              setDeleteError("");
            }}
          >
            <DialogHeader onClose={() => !deleting && setDeleteOpen(false)}>
              <DialogTitle>Excluir {user.name || user.email}?</DialogTitle>
              <DialogDescription>Não dá para desfazer.</DialogDescription>
            </DialogHeader>
            <DialogContent className="space-y-4">
              {deleteError && <Alert variant="error">{deleteError}</Alert>}
              <Input
                label={`Digite ${user.email} para confirmar`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                autoComplete="off"
              />
            </DialogContent>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                isLoading={deleting}
                disabled={deleteConfirm.trim().toLowerCase() !== user.email}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError("");
                  try {
                    const res = await fetch(`/api/admin/users/${user.id}`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ confirm: deleteConfirm }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!data.success) {
                      setDeleteError(data.error || "Não foi possível excluir.");
                      return;
                    }
                    router.replace("/admin/usuarios");
                  } catch {
                    setDeleteError("Falha de conexão. Nada foi confirmado; recarregue a página.");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                Excluir definitivamente
              </Button>
            </DialogFooter>
          </Dialog>
        </>
      )}
    </div>
  );
}
