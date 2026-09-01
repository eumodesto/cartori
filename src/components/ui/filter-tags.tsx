"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface FilterTagItem {
  id: string;
  label: string;
  count: number;
}

export interface FilterTagsProps {
  items: FilterTagItem[];
  active: Set<string>;
  onChange: (next: Set<string>) => void;
  allId?: string;
  className?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export function FilterTags({
  items,
  active,
  onChange,
  allId = "all",
  className,
  query,
  onQueryChange,
  searchPlaceholder = "Buscar certidão...",
}: FilterTagsProps) {
  const toggle = (id: string) => {
    if (id === allId) {
      onChange(new Set());
      return;
    }

    const next = new Set(active);
    next.delete(allId);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const selectedCategories = [...active].filter((id) => id !== allId);
  const totalResults =
    selectedCategories.length === 0
      ? items.find((item) => item.id === allId)?.count ??
        items.reduce((sum, item) => (item.id === allId ? sum : sum + item.count), 0)
      : items
          .filter((item) => selectedCategories.includes(item.id))
          .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {onQueryChange && (
        <div className="relative max-w-md mx-auto">
          <Input
            type="text"
            value={query ?? ""}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Buscar certidões"
            autoComplete="off"
            leftIcon={<Search className="w-4 h-4" />}
            className="pr-10 text-left"
          />
          {(query ?? "").length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-sm text-neutral-400 hover:text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-neutral-500 text-xs">
          {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
        </span>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="text-neutral-500 text-xs underline-offset-2 hover:text-neutral-900 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item) => {
          const isActive =
            item.id === allId ? selectedCategories.length === 0 : active.has(item.id);

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`Filtrar por ${item.label}`}
              onClick={() => toggle(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors duration-fast",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",
                isActive
                  ? "bg-brand-950 text-neutral-0 border-brand-950"
                  : "bg-neutral-0 text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {item.label}
              <Badge
                size="sm"
                variant={isActive ? "brand" : "outline"}
                className={cn(
                  "transition-colors",
                  isActive && "bg-neutral-0/20 text-neutral-0 border-transparent"
                )}
              >
                {item.count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
