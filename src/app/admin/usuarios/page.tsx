"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/components/auth/auth-provider";
import { cn, maskCpfCnpj } from "@/lib/utils";

type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CLIENT" | "OPERATOR" | "ADMIN";
  phone: string | null;
  cpf: string | null;
  createdAt: string;
  organization: { id: string; name: string; plan: string } | null;
  ordersCount: number;
  dossiersCount: number;
};

const ROLE_LABEL: Record<ManagedUser["role"], string> = {
  CLIENT: "Cliente",
  OPERATOR: "Operador",
  ADMIN: "Administrador",
};

const ROLE_BADGE: Record<ManagedUser["role"], string> = {
  CLIENT: "bg-neutral-100 text-neutral-700 border-neutral-200",
  OPERATOR: "bg-semantic-info-bg text-semantic-info border-semantic-info-border",
  ADMIN: "bg-brand-50 text-brand-800 border-brand-200",
};

function RoleBadge({ role }: { role: ManagedUser["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        ROLE_BADGE[role]
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

const TABS = [
  { id: "all", label: "Todos" },
  { id: "CLIENT", label: "Clientes" },
  { id: "staff", label: "Equipe" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isStaffRole(role: string | undefined) {
  return role === "ADMIN" || role === "OPERATOR";
}

export default function UsuariosPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = React.useState<ManagedUser[]>([]);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);
  const [tab, setTab] = React.useState<TabId>("all");
  const [query, setQuery] = React.useState("");

  const isAdmin = profile?.role === "ADMIN";

  React.useEffect(() => {
    if (!loading && profile && !isAdmin) {
      router.replace("/painel");
    }
  }, [loading, profile, isAdmin, router]);

  React.useEffect(() => {
    if (!isAdmin) return;
    setFetching(true);
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
  }, [isAdmin]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }
  if (!isAdmin) return null;

  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const filtered = users.filter((user) => {
    if (tab === "CLIENT" && user.role !== "CLIENT") return false;
    if (tab === "staff" && !isStaffRole(user.role)) return false;
    if (!normalized) return true;
    const haystack = [user.name, user.email, user.cpf, user.organization?.name]
      .filter(Boolean)
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Usuários & Clientes"
        description="Gestão de contas da plataforma. Visualize clientes e equipe, e ajuste dados e papel de acesso."
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
              <TableHead>Papel</TableHead>
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
                  <RoleBadge role={user.role} />
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
    </div>
  );
}
