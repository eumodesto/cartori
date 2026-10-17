"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AccessLevelFields } from "@/components/admin/access-level-fields";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accessLevelLabel, hasFullAdminAccess } from "@/lib/admin-permissions";
import { cn, maskCpfCnpj } from "@/lib/utils";

type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CLIENT" | "OPERATOR" | "ADMIN";
  staffPermissions: string[];
  phone: string | null;
  cpf: string | null;
  createdAt: string;
  organization: { id: string; name: string; plan: string } | null;
  ordersCount: number;
  dossiersCount: number;
};

const ROLE_BADGE: Record<ManagedUser["role"], string> = {
  CLIENT: "bg-neutral-100 text-neutral-700 border-neutral-200",
  OPERATOR: "bg-semantic-info-bg text-semantic-info border-semantic-info-border",
  ADMIN: "bg-brand-50 text-brand-800 border-brand-200",
};

function RoleBadge({ role, permissions }: { role: ManagedUser["role"]; permissions: string[] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        ROLE_BADGE[role]
      )}
    >
      {accessLevelLabel(role, permissions)}
    </span>
  );
}

const TABS = [
  { id: "all", label: "Todos" },
  { id: "CLIENT", label: "Clientes" },
  { id: "staff", label: "Equipe" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const isStaffUser = (user: ManagedUser) => user.role === "ADMIN" || user.role === "OPERATOR";

type NewUserForm = {
  name: string;
  email: string;
  phone: string;
  role: ManagedUser["role"];
  permissions: string[];
};

const EMPTY_FORM: NewUserForm = { name: "", email: "", phone: "", role: "CLIENT", permissions: [] };

export default function UsuariosPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const actorFull = profile ? hasFullAdminAccess(profile.role, profile.staffPermissions ?? []) : false;
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewUserForm>(EMPTY_FORM);
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState("");
  const [users, setUsers] = React.useState<ManagedUser[]>([]);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);
  const [tab, setTab] = React.useState<TabId>("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar os usuários.");
          return;
        }
        setUsers(data.users || []);
      })
      .catch(() => setError("Falha ao carregar os usuários."))
      .finally(() => setFetching(false));
  }, []);

  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const filtered = users.filter((user) => {
    if (tab === "CLIENT" && user.role !== "CLIENT") return false;
    if (tab === "staff" && !isStaffUser(user)) return false;
    if (!normalized) return true;
    const haystack = [user.name, user.email, user.cpf, user.organization?.name]
      .filter(Boolean)
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  const closeCreate = () => {
    if (creating) return;
    setCreateOpen(false);
    setForm(EMPTY_FORM);
    setCreateError("");
  };

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          staffPermissions: form.permissions,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setCreateError(data.error || "Não foi possível cadastrar.");
        return;
      }
      router.push(`/admin/usuarios/${data.user.id}`);
    } catch {
      setCreateError("Falha de conexão. Confira a lista antes de tentar de novo.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Clientes, operadores e administradores. Cadastre, ajuste o nível de acesso ou exclua contas."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4" aria-hidden />
            Novo usuário
          </Button>
        }
        badge={
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            {users.length} contas
          </span>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-0 p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                tab === item.id
                  ? "bg-brand-950 text-neutral-0"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="sm:w-72">
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {fetching ? (
        <p className="text-sm text-neutral-500">Carregando usuários...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum usuário encontrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Nível de acesso</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Organização</TableHead>
              <TableHead>Pedidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/admin/usuarios/${user.id}`}
                    className="font-medium text-brand-800 hover:underline"
                  >
                    {user.name || "(sem nome)"}
                  </Link>
                  <p className="text-[11px] text-neutral-500">{user.email}</p>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} permissions={user.staffPermissions || []} />
                </TableCell>
                <TableCell className="font-mono text-xs text-neutral-600">
                  {user.cpf ? maskCpfCnpj(user.cpf) : "—"}
                </TableCell>
                <TableCell className="text-xs text-neutral-600">
                  {user.organization?.name || "—"}
                </TableCell>
                <TableCell className="text-xs text-neutral-600">
                  {user.ordersCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog isOpen={createOpen} onClose={closeCreate} size="lg">
        <form onSubmit={submitCreate} className="flex min-h-0 flex-col">
          <DialogHeader onClose={closeCreate}>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>
              A pessoa recebe um e-mail e cria a própria senha em &quot;Esqueci minha senha&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-4">
            {createError && <Alert variant="error">{createError}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome completo"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <Input
                label="E-mail"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Telefone"
                value={form.phone}
                placeholder="(11) 99999-9999"
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <AccessLevelFields
              role={form.role}
              permissions={form.permissions}
              onChange={(next) => setForm((prev) => ({ ...prev, role: next.role, permissions: next.permissions }))}
              canManageAdmins={actorFull}
            />
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeCreate} disabled={creating}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={creating}>
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
