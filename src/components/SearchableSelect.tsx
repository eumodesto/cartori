"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X, Loader2 } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  subtext?: string;
  badge?: string;
  highlight?: boolean;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  required?: boolean;
  rightBadge?: React.ReactNode;
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SearchableSelect({
  label,
  placeholder = "Selecione uma opção...",
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  loadingText = "Carregando...",
  emptyText = "Nenhuma opção encontrada",
  required = false,
  rightBadge,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quando abre o dropdown, foca automaticamente no campo de pesquisa
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filtra as opções com suporte a busca sem acentos
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const query = normalize(searchTerm);
    return (
      normalize(opt.label).includes(query) ||
      (opt.subtext && normalize(opt.subtext).includes(query)) ||
      (opt.badge && normalize(opt.badge).includes(query))
    );
  });

  return (
    <div className="space-y-1.5 w-full" ref={containerRef}>
      {/* Label & Badge Header */}
      {(label || rightBadge) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-xs font-semibold text-slate-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {rightBadge && <div>{rightBadge}</div>}
        </div>
      )}

      {/* Main Trigger Box */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full text-left text-xs bg-slate-50 border rounded-xl p-3 flex items-center justify-between transition-all font-medium ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
              : isOpen
              ? "border-primary-600 ring-2 ring-primary-100 bg-white shadow-sm"
              : "border-slate-300 hover:border-slate-400 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {loading ? (
              <span className="text-slate-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                {loadingText}
              </span>
            ) : selectedOption ? (
              <div className="truncate">
                <span className="font-semibold text-slate-900">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            {value && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="p-1 hover:text-slate-600 rounded-md transition-colors"
                title="Limpar seleção"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary-600" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown Popover */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Live Search Input Box */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para filtrar instantaneamente..."
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-500 font-medium placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <p>{emptyText}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Tente buscar por outro termo</p>
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        opt.highlight
                          ? "bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 my-1"
                          : isSelected
                          ? "bg-primary-50 text-primary-900 font-bold"
                          : "hover:bg-slate-100 text-slate-700 font-medium"
                      }`}
                    >
                      <div className="pr-3 truncate">
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.subtext && (
                          <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            {opt.subtext}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
