"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, RefreshCw, Trash2, UserPlus, X } from "lucide-react";
import { AccessLevelFields } from "@/components/admin/access-level-fields";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BulkActionBar,
  CategoryChips,
  ListToolbar,
  RowCheckbox,
  SelectAllCheckbox,
  useRowSelection,
} from "@/components/ui/data-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accessLevelLabel, hasFullAdminAccess } from "@/lib/admin-permissions";
import { downloadCsv, formatCsvDate, toCsv } from "@/lib/csv";
import { PERIOD_OPTIONS, inPeriod, matchesSearch } from "@/lib/list-filters";
import { BULK_ORDER_LIMIT, DELETE_CONFIRM_WORD } from "@/lib/order-bulk";
import { formatLoginDate, isOnline, timeAgo } from "@/lib/presence-rules";
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
  lastLoginAt: string | null;
  lastSeenAt: string | null;
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

/** Último login e "Online" (visto nos últimos 5 minutos). */
function LastAccess({ user }: { user: ManagedUser }) {
  if (isOnline(user.lastSeenAt)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-semantic-success-border bg-semantic-success-bg px-2 py-0.5 text-[11px] font-semibold text-semantic-success">
        <span className="h-2 w-2 rounded-full bg-semantic-success" aria-hidden />
        Online
      </span>
    );
  }
  if (!user.lastLoginAt) return <span className="text-xs text-neutral-400">Nunca entrou</span>;
  return (
    <div>
      <p className="text-xs text-neutral-700">{formatLoginDate(user.lastLoginAt)}</p>
      {user.lastSeenAt && (
        <p className="text-[11px] text-neutral-500">Visto {timeAgo(user.lastSeenAt)}</p>
      )}
    </div>
  );
}

/** Categorias: nível de acesso e contas de empresa. */
const CATEGORIES = [
  { id: "online", label: "Online agora", test: (u: ManagedUser) => isOnline(u.lastSeenAt) },
  { id: "CLIENT", label: "Clientes", test: (u: ManagedUser) => u.role === "CLIENT" },
  { id: "OPERATOR", label: "Operadores", test: (u: ManagedUser) => u.role === "OPERATOR" },
  { id: "ADMIN", label: "Administradores", test: (u: ManagedUser) => u.role === "ADMIN" },
  { id: "company", label: "Empresas", test: (u: ManagedUser) => Boolean(u.organization) },
] as const;

const ORDERS_FILTER = [
  { value: "", label: "Com ou sem pedidos" },
  { value: "with", label: "Com pedidos" },
  { value: "without", label: "Sem pedidos" },
];

const LOGIN_FILTER = [
  { value: "", label: "Qualquer acesso" },
  { value: "7", label: "Entrou nos últimos 7 dias" },
  { value: "30", label: "Entrou nos últimos 30 dias" },
  { value: "inactive", label: "Sem entrar há 30 dias" },
  { value: "never", label: "Nunca entrou" },
];

const CONTACT_FILTER = [
  { value: "", label: "Qualquer cadastro" },
  { value: "no-phone", label: "Sem telefone" },
  { value: "no-cpf", label: "Sem CPF" },
];

type NewUserForm = {
  name: string;
  email: string;
  phone: string;
  role: ManagedUser["role"];
  permissions: string[];
};

const EMPTY_FORM: NewUserForm = { name: "", email: "", phone: "", role: "CLIENT", permissions: [] };

type Skip = { id: string; email: string | null; reason: string };
type Notice = { variant: "success" | "warning" | "error"; text: string; skipped?: Skip[] };

export default function UsuariosPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const actorFull = profile ? hasFullAdminAccess(profile.role, profile.staffPermissions ?? []) : false;

  const [users, setUsers] = React.useState<ManagedUser[]>([]);
  const [error, setError] = React.useState("");
  const [fetching, setFetching] = React.useState(true);

  const [category, setCategory] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [ordersFilter, setOrdersFilter] = React.useState("");
  const [contactFilter, setContactFilter] = React.useState("");
  const [loginFilter, setLoginFilter] = React.useState("");
  const [period, setPeriod] = React.useState("");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewUserForm>(EMPTY_FORM);
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState("");

  const [dialog, setDialog] = React.useState<"role" | "delete" | null>(null);
  const [bulkRole, setBulkRole] = React.useState("");
  const [confirmWord, setConfirmWord] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);

  const load = React.useCallback(() => {
    setFetching(true);
    return fetch("/api/admin/users", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível carregar os usuários.");
          return;
        }
        setError("");
        setUsers(data.users || []);
      })
      .catch(() => setError("Falha ao carregar os usuários."))
      .finally(() => setFetching(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const selection = useRowSelection(users);

  const filtered = users.filter((user) => {
    const cat = CATEGORIES.find((item) => item.id === category);
    if (cat && !cat.test(user)) return false;
    if (ordersFilter === "with" && user.ordersCount === 0) return false;
    if (ordersFilter === "without" && user.ordersCount > 0) return false;
    if (contactFilter === "no-phone" && user.phone) return false;
    if (contactFilter === "no-cpf" && user.cpf) return false;
    if (!inPeriod(user.createdAt, period)) return false;
    if (loginFilter === "never" && user.lastLoginAt) return false;
    if (loginFilter === "inactive" && user.lastLoginAt && inPeriod(user.lastLoginAt, "30")) return false;
    if ((loginFilter === "7" || loginFilter === "30") && (!user.lastLoginAt || !inPeriod(user.lastLoginAt, loginFilter))) {
      return false;
    }
    return matchesSearch(query, [user.name, user.email, user.cpf, user.phone, user.organization?.name]);
  });

  const resetFilters = () => {
    setCategory("");
    setQuery("");
    setOrdersFilter("");
    setContactFilter("");
    setLoginFilter("");
    setPeriod("");
  };

  const selectedUsers = selection.selectedRows;
  const selfSelected = selectedUsers.some((user) => user.id === profile?.id);

  const exportCsv = (rows: ManagedUser[]) => {
    downloadCsv(
      "usuarios",
      toCsv(
        ["Nome", "E-mail", "Telefone", "CPF", "Nível de acesso", "Empresa", "Pedidos", "Cadastro", "Último login"],
        rows.map((user) => [
          user.name,
          user.email,
          user.phone,
          user.cpf ? maskCpfCnpj(user.cpf) : "",
          accessLevelLabel(user.role, user.staffPermissions || []),
          user.organization?.name,
          user.ordersCount,
          formatCsvDate(user.createdAt),
          user.lastLoginAt ? formatCsvDate(user.lastLoginAt) : "",
        ])
      )
    );
  };

  const closeDialog = () => {
    if (busy) return;
    setDialog(null);
    setBulkRole("");
    setConfirmWord("");
  };

  const runBulk = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userIds: selectedUsers.map((user) => user.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        setNotice({ variant: "error", text: data.error || "Não foi possível aplicar a ação." });
        return;
      }
      const skipped: Skip[] = data.skipped || [];
      const verb = payload.action === "delete" ? "excluída(s)" : "atualizada(s)";
      setNotice({
        variant: skipped.length ? "warning" : "success",
        text: `${data.done.length} conta(s) ${verb}.${skipped.length ? ` ${skipped.length} ficaram de fora:` : ""}`,
        skipped,
      });
      selection.clear();
      setDialog(null);
      setBulkRole("");
      setConfirmWord("");
      await load();
    } catch {
      setNotice({ variant: "error", text: "Falha de conexão. Nada foi confirmado; recarregue a lista." });
    } finally {
      setBusy(false);
    }
  };

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
        badge={
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            {users.length} contas
          </span>
        }
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4" aria-hidden />
            Novo usuário
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}
      {notice && (
        <Alert variant={notice.variant}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p>{notice.text}</p>
              {notice.skipped && notice.skipped.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {notice.skipped.map((skip) => (
                    <li key={skip.id}>
                      {skip.email ?? skip.id.slice(0, 8)}: {skip.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso">
              <X className="w-4 h-4" />
            </button>
          </div>
        </Alert>
      )}

      <CategoryChips
        total={users.length}
        value={category}
        onChange={setCategory}
        items={CATEGORIES.map((item) => ({
          id: item.id,
          label: item.label,
          count: users.filter(item.test).length,
        }))}
      />

      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Nome, e-mail, CPF, telefone ou empresa"
        shown={filtered.length}
        total={users.length}
        onReset={resetFilters}
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              <Download className="w-4 h-4" aria-hidden />
              Exportar lista
            </Button>
            <Button variant="ghost" size="md" onClick={() => load()} disabled={fetching} aria-label="Atualizar">
              <RefreshCw className={fetching ? "w-4 h-4 animate-spin" : "w-4 h-4"} aria-hidden />
            </Button>
          </>
        }
      >
        <Select aria-label="Pedidos" value={ordersFilter} onChange={(e) => setOrdersFilter(e.target.value)} options={ORDERS_FILTER} />
        <Select aria-label="Dados do cadastro" value={contactFilter} onChange={(e) => setContactFilter(e.target.value)} options={CONTACT_FILTER} />
        <Select aria-label="Último acesso" value={loginFilter} onChange={(e) => setLoginFilter(e.target.value)} options={LOGIN_FILTER} />
        <Select aria-label="Data de cadastro" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIOD_OPTIONS} />
      </ListToolbar>

      <BulkActionBar
        count={selection.count}
        onClear={selection.clear}
        note={
          selection.count > BULK_ORDER_LIMIT ? (
            <span className="text-semantic-error">Ações em massa aceitam até {BULK_ORDER_LIMIT} contas por vez.</span>
          ) : selfSelected ? (
            <span className="text-neutral-600">A sua conta está na seleção e será pulada.</span>
          ) : null
        }
      >
        <Button size="sm" onClick={() => setDialog("role")} disabled={selection.count > BULK_ORDER_LIMIT}>
          Alterar nível
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportCsv(selectedUsers)}>
          <Download className="w-4 h-4" aria-hidden />
          Exportar CSV
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setDialog("delete")}
          disabled={selection.count > BULK_ORDER_LIMIT}
        >
          <Trash2 className="w-4 h-4" aria-hidden />
          Excluir
        </Button>
      </BulkActionBar>

      {fetching && users.length === 0 ? (
        <p className="text-sm text-neutral-500">Carregando usuários...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {users.length === 0 ? "Nenhum usuário cadastrado." : "Nenhum usuário com esses filtros."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectAllCheckbox
                  checked={selection.allSelected(filtered)}
                  onChange={() => selection.toggleAll(filtered)}
                />
              </TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Nível de acesso</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Organização</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Último acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} isSelected={selection.isSelected(user.id)}>
                <TableCell>
                  <RowCheckbox
                    label={`Selecionar ${user.name || user.email}`}
                    checked={selection.isSelected(user.id)}
                    onChange={() => selection.toggle(user.id)}
                  />
                </TableCell>
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
                <TableCell className="text-xs text-neutral-600">{user.ordersCount}</TableCell>
                <TableCell>
                  <LastAccess user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog isOpen={dialog === "role"} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <DialogTitle>Alterar nível de {selection.count} conta(s)</DialogTitle>
          <DialogDescription>
            Em massa, só entre Cliente e Operador. Administrador é definido na página de cada conta.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <Select
            label="Novo nível"
            placeholder="Escolha o nível"
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value)}
            options={[
              { value: "CLIENT", label: "Cliente" },
              { value: "OPERATOR", label: "Operador" },
            ]}
          />
          {selectedUsers.some((user) => user.role === "ADMIN") && (
            <p className="text-xs text-neutral-600">
              {actorFull
                ? "Administradores na seleção perdem o acesso de administrador."
                : "Administradores na seleção serão pulados: exige acesso total."}
            </p>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={() => runBulk({ action: "role", role: bulkRole })} disabled={busy || !bulkRole}>
            {busy ? "Aplicando…" : `Aplicar em ${selection.count}`}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog isOpen={dialog === "delete"} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <DialogTitle>Excluir {selection.count} conta(s)</DialogTitle>
          <DialogDescription>
            Remove login e cadastro. Pedidos ficam guardados e voltam se a pessoa criar conta de novo com o mesmo
            e-mail. Não dá para desfazer.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-xs text-neutral-600">
            A sua conta, administradores (sem acesso total) e o último administrador com acesso total são pulados.
          </p>
          <Input
            label={`Digite ${DELETE_CONFIRM_WORD} para confirmar`}
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            autoComplete="off"
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => runBulk({ action: "delete", confirm: confirmWord })}
            disabled={busy || confirmWord.trim().toUpperCase() !== DELETE_CONFIRM_WORD}
          >
            {busy ? "Excluindo…" : `Excluir ${selection.count}`}
          </Button>
        </DialogFooter>
      </Dialog>

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
