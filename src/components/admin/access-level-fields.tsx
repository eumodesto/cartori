"use client";

import * as React from "react";
import type { UserRole } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ACCESS_LEVELS, ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

/**
 * Nível de acesso (papel) e, para administrador, as áreas liberadas.
 * `permissions` vazio = acesso total. Só UI: as regras valem no servidor (admin-user-rules).
 */
export function AccessLevelFields({
  role,
  permissions,
  onChange,
  canManageAdmins,
  disabled,
  disabledReason,
}: {
  role: UserRole;
  permissions: string[];
  onChange: (next: { role: UserRole; permissions: string[] }) => void;
  /** Quem edita tem acesso total: pode escolher Administrador e mudar permissões. */
  canManageAdmins: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const fullAccess = permissions.length === 0;
  // Lembra a última seleção restrita, para o interruptor de acesso total não apagá-la.
  const lastRestricted = React.useRef<string[]>(permissions.length ? permissions : ["users"]);
  React.useEffect(() => {
    if (permissions.length) lastRestricted.current = permissions;
  }, [permissions]);

  const togglePermission = (key: string) => {
    const next = permissions.includes(key)
      ? permissions.filter((item) => item !== key)
      : [...permissions, key];
    // Desmarcar tudo não vira "acesso total" por engano: mantém ao menos uma área.
    if (next.length === 0) return;
    onChange({ role, permissions: next });
  };

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-sm font-medium text-neutral-800">Nível de acesso</legend>
      {disabledReason && <p className="text-xs text-neutral-500">{disabledReason}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ACCESS_LEVELS.map((level) => {
          const locked = level.role === "ADMIN" && !canManageAdmins && role !== "ADMIN";
          const active = role === level.role;
          return (
            <label
              key={level.role}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors",
                active ? "border-brand-500 bg-brand-50" : "border-neutral-200 hover:border-neutral-300",
                (locked || disabled) && "cursor-not-allowed opacity-60"
              )}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="access-level"
                  className="accent-brand-700"
                  checked={active}
                  disabled={locked || disabled}
                  onChange={() =>
                    onChange({ role: level.role, permissions: level.role === "ADMIN" ? permissions : [] })
                  }
                />
                <span className="text-sm font-semibold text-neutral-900">{level.label}</span>
              </span>
              <span className="text-xs text-neutral-600 leading-relaxed">{level.description}</span>
              {locked && (
                <span className="text-[11px] text-neutral-500">Exige administrador com acesso total.</span>
              )}
            </label>
          );
        })}
      </div>

      {role === "ADMIN" && (
        <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
          <Switch
            label="Acesso total"
            description="Todas as áreas, inclusive as que forem criadas depois, e a gestão de outros administradores."
            checked={fullAccess}
            disabled={!canManageAdmins || disabled}
            onChange={(checked) =>
              onChange({
                role,
                permissions: checked ? [] : lastRestricted.current,
              })
            }
          />
          {!fullAccess && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {ADMIN_PERMISSIONS.map((permission) => (
                <Checkbox
                  key={permission.key}
                  label={permission.label}
                  description={permission.description}
                  checked={permissions.includes(permission.key)}
                  disabled={!canManageAdmins || disabled}
                  onChange={() => togglePermission(permission.key)}
                />
              ))}
            </div>
          )}
          <p className="text-[11px] text-neutral-500">
            A mesa operacional (Pedidos) vale para todo administrador e operador.
          </p>
        </div>
      )}
    </fieldset>
  );
}
