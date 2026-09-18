"use client";

import * as React from "react";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/auth-provider";
import { maskCpfCnpj } from "@/lib/utils";
import {
  NOTIFICATION_CATEGORIES,
  resolveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";

const ROLE_LABEL: Record<string, string> = {
  CLIENT: "Cliente",
  OPERATOR: "Operador",
  ADMIN: "Administrador",
};

type Msg = { type: "success" | "error"; text: string } | null;

function Feedback({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <Alert variant={msg.type}>{msg.text}</Alert>;
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-6">
      <div>
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function PerfilPage() {
  const { profile, loading, refresh } = useAuth();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [savingData, setSavingData] = React.useState(false);
  const [dataMsg, setDataMsg] = React.useState<Msg>(null);

  const [avatarMsg, setAvatarMsg] = React.useState<Msg>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [newEmail, setNewEmail] = React.useState("");
  const [emailPassword, setEmailPassword] = React.useState("");
  const [savingEmail, setSavingEmail] = React.useState(false);
  const [emailMsg, setEmailMsg] = React.useState<Msg>(null);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [passwordMsg, setPasswordMsg] = React.useState<Msg>(null);

  const [prefs, setPrefs] = React.useState<NotificationPrefs>(() =>
    resolveNotificationPrefs(null)
  );
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [prefsMsg, setPrefsMsg] = React.useState<Msg>(null);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setPrefs(resolveNotificationPrefs(profile.notificationPrefs));
    }
  }, [profile]);

  if (loading || !profile) {
    return <p className="text-sm text-neutral-500">Carregando perfil...</p>;
  }

  const initials =
    (profile.name || profile.email)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "CT";

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setAvatarMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) {
        setAvatarMsg({ type: "error", text: data.error || "Não foi possível enviar a foto." });
      } else {
        await refresh();
        setAvatarMsg({ type: "success", text: "Foto atualizada." });
      }
    } catch {
      setAvatarMsg({ type: "error", text: "Falha ao enviar a foto." });
    } finally {
      setUploading(false);
    }
  };

  const saveData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingData(true);
    setDataMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!data.success) setDataMsg({ type: "error", text: data.error || "Não foi possível salvar." });
      else {
        await refresh();
        setDataMsg({ type: "success", text: "Dados atualizados." });
      }
    } catch {
      setDataMsg({ type: "error", text: "Falha ao salvar os dados." });
    } finally {
      setSavingData(false);
    }
  };

  const saveEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingEmail(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, currentPassword: emailPassword }),
      });
      const data = await res.json();
      if (!data.success) setEmailMsg({ type: "error", text: data.error || "Não foi possível alterar." });
      else {
        setNewEmail("");
        setEmailPassword("");
        setEmailMsg({
          type: "success",
          text: data.message || "Verifique o link enviado ao novo e-mail para concluir.",
        });
      }
    } catch {
      setEmailMsg({ type: "error", text: "Falha ao alterar o e-mail." });
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "A confirmação não confere com a nova senha." });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) setPasswordMsg({ type: "error", text: data.error || "Não foi possível alterar." });
      else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg({ type: "success", text: "Senha alterada com sucesso." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Falha ao alterar a senha." });
    } finally {
      setSavingPassword(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    setPrefsMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPrefs: prefs }),
      });
      const data = await res.json();
      if (!data.success) setPrefsMsg({ type: "error", text: data.error || "Não foi possível salvar." });
      else {
        await refresh();
        setPrefsMsg({ type: "success", text: "Preferências salvas." });
      }
    } catch {
      setPrefsMsg({ type: "error", text: "Falha ao salvar as preferências." });
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Meu perfil"
        description="Gerencie sua foto, dados de contato, e-mail, senha e as notificações que deseja receber."
      />

      {/* Foto de perfil */}
      <Card title="Foto de perfil" description="PNG, JPG ou WEBP, até 2 MB.">
        <Feedback msg={avatarMsg} />
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-brand-800">{initials}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onPickAvatar}
              isLoading={uploading}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Enviar foto
            </Button>
            <p className="text-[11px] text-neutral-500">A imagem aparece no seu menu e cabeçalho.</p>
          </div>
        </div>
      </Card>

      {/* Dados pessoais */}
      <Card title="Dados de contato">
        <Feedback msg={dataMsg} />
        <form onSubmit={saveData} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              helperText="DDD + número, 10 ou 11 dígitos."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="CPF" value={profile.cpf ? maskCpfCnpj(profile.cpf) : "—"} disabled />
            <Input
              label="Papel de acesso"
              value={ROLE_LABEL[profile.role] ?? profile.role}
              disabled
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={savingData}>
              Salvar dados
            </Button>
          </div>
        </form>
      </Card>

      {/* E-mail */}
      <Card
        title="E-mail de acesso"
        description={`Atual: ${profile.email}. A troca exige confirmação pelo link enviado ao novo e-mail.`}
      >
        <Feedback msg={emailMsg} />
        <form onSubmit={saveEmail} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Novo e-mail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Senha atual"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={savingEmail}>
              Alterar e-mail
            </Button>
          </div>
        </form>
      </Card>

      {/* Senha */}
      <Card title="Senha" description="Mínimo de 8 caracteres.">
        <Feedback msg={passwordMsg} />
        <form onSubmit={savePassword} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={savingPassword}>
              Alterar senha
            </Button>
          </div>
        </form>
      </Card>

      {/* Notificações */}
      <Card
        title="Notificações por e-mail"
        description="Escolha quais tipos de e-mail deseja receber. Confirmações de pagamento e mensagens críticas são sempre enviadas."
      >
        <Feedback msg={prefsMsg} />
        <div className="space-y-3">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <div key={category.id} className="rounded-md border border-neutral-200 p-3">
              <Checkbox
                checked={prefs[category.id] !== false}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, [category.id]: e.target.checked }))
                }
                label={category.label}
                description={category.description}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={savePrefs} isLoading={savingPrefs}>
            Salvar preferências
          </Button>
        </div>
      </Card>
    </div>
  );
}
