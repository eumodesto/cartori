"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Peças comuns das listagens: seleção múltipla, chips de categoria, barra de filtros e barra de
 * ações em massa. Cada tela decide as categorias, os filtros e as ações.
 */

export function useRowSelection<T extends { id: string }>(rows: readonly T[]) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Linha que saiu da lista (recarregou, excluída) sai da seleção.
  React.useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(rows.map((row) => row.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const toggle = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = (visible: readonly T[]) =>
    visible.length > 0 && visible.every((row) => selected.has(row.id));

  const toggleAll = (visible: readonly T[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (visible.length > 0 && visible.every((row) => prev.has(row.id))) {
        visible.forEach((row) => next.delete(row.id));
      } else {
        visible.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  return {
    selected,
    count: selected.size,
    isSelected: (id: string) => selected.has(id),
    toggle,
    toggleAll,
    allSelected,
    clear: () => setSelected(new Set()),
    selectedRows: rows.filter((row) => selected.has(row.id)),
  };
}

export function SelectAllCheckbox({
  checked,
  onChange,
  label = "Selecionar todos os itens visíveis",
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return <Checkbox aria-label={label} checked={checked} onChange={onChange} />;
}

export function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return <Checkbox aria-label={label} checked={checked} onChange={onChange} />;
}

export type CategoryChip = { id: string; label: string; count?: number };

/** Uma categoria por vez; "" = todas. */
export function CategoryChips({
  items,
  value,
  onChange,
  allLabel = "Todos",
  total,
}: {
  items: CategoryChip[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  total?: number;
}) {
  const chips: CategoryChip[] = [{ id: "", label: allLabel, count: total }, ...items];
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias">
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <button
            key={chip.id || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(chip.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              active
                ? "border-brand-950 bg-brand-950 text-neutral-0"
                : "border-neutral-200 bg-neutral-0 text-neutral-700 hover:border-neutral-300"
            )}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-white/20 text-neutral-0" : "bg-neutral-100 text-neutral-500"
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Busca + filtros extras (selects) + total e "Limpar filtros". */
export function ListToolbar({
  query,
  onQueryChange,
  searchPlaceholder = "Buscar",
  children,
  shown,
  total,
  onReset,
  actions,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Selects de filtro. */
  children?: React.ReactNode;
  shown: number;
  total: number;
  onReset?: () => void;
  /** Botões à direita (atualizar, exportar tudo…). */
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative w-full lg:max-w-sm">
          <Input
            aria-label="Buscar"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-sm text-neutral-400 hover:text-neutral-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {children && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:flex">{children}</div>}
        {actions && <div className="flex gap-2 lg:ml-auto">{actions}</div>}
      </div>
      <p className="text-xs text-neutral-500">
        {shown === total ? `${total} item(ns)` : `${shown} de ${total} item(ns)`}
        {onReset && shown !== total && (
          <>
            {" · "}
            <button type="button" onClick={onReset} className="font-semibold text-brand-800 hover:underline">
              Limpar filtros
            </button>
          </>
        )}
      </p>
    </div>
  );
}

/** Barra fixa com a contagem e as ações do que está selecionado. */
export function BulkActionBar({
  count,
  onClear,
  children,
  note,
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
  note?: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow-sm">
      <span className="text-sm font-semibold text-brand-950">{count} selecionado(s)</span>
      <span className="hidden sm:inline text-neutral-300">|</span>
      {children}
      <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
        Limpar seleção
      </Button>
      {note && <div className="basis-full text-xs">{note}</div>}
    </div>
  );
}
