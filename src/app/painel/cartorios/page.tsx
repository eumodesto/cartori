"use client";

import * as React from "react";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";
import { matchesSearch } from "@/lib/list-filters";
import { Input } from "@/components/ui/input";
import type { CartorioInfo } from "@/lib/types";

type Option = { value: string; label: string };

const CATEGORIES: Option[] = [
  { value: "geral", label: "Todas as atribuições" },
  { value: "imoveis", label: "Registro de Imóveis" },
  { value: "notas", label: "Tabelionato de Notas" },
  { value: "protesto", label: "Tabelionato de Protesto" },
  { value: "registro-civil", label: "Registro Civil" },
  { value: "pessoa-juridica", label: "Títulos e Documentos / Pessoa Jurídica" },
];

/** Consulta de cartórios (B2B): endereço, telefone e e-mail registrados de cada serventia. */
export default function CartoriosPage() {
  const [states, setStates] = React.useState<Option[]>([]);
  const [cities, setCities] = React.useState<Option[]>([]);
  const [uf, setUf] = React.useState("");
  const [city, setCity] = React.useState("");
  const [category, setCategory] = React.useState("geral");
  const [query, setQuery] = React.useState("");
  const [cartorios, setCartorios] = React.useState<CartorioInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/locations/states")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.states || []) as Array<{ sigla: string; nome: string }>;
        setStates(list.map((s) => ({ value: s.sigla, label: `${s.nome} (${s.sigla})` })).sort((a, b) => a.label.localeCompare(b.label, "pt-BR")));
      })
      .catch(() => setError("Não foi possível carregar os estados."));
  }, []);

  React.useEffect(() => {
    setCity("");
    setCities([]);
    setCartorios([]);
    if (!uf) return;
    fetch(`/api/locations/cities?uf=${uf}`)
      .then((res) => res.json())
      .then((data) => {
        const list = (data.cities || []) as Array<{ nome: string }>;
        setCities(list.map((c) => ({ value: c.nome, label: c.nome })));
      })
      .catch(() => setError("Não foi possível carregar os municípios."));
  }, [uf]);

  React.useEffect(() => {
    if (!uf || !city) return;
    setLoading(true);
    setError("");
    fetch(`/api/cartorios?uf=${uf}&city=${encodeURIComponent(city)}&category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "Não foi possível consultar os cartórios.");
          setCartorios([]);
          return;
        }
        // Placeholders (busca pela equipe) não são serventias de verdade: ficam fora da consulta.
        setCartorios(((data.cartorios || []) as CartorioInfo[]).filter((item) => item.source !== "placeholder"));
      })
      .catch(() => setError("Falha ao consultar os cartórios."))
      .finally(() => setLoading(false));
  }, [uf, city, category]);

  const visible = cartorios.filter((item) => matchesSearch(query, [item.name, item.attribution, item.address, item.cns]));
  const withContact = cartorios.filter((item) => item.phone || item.address).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consulta de cartórios"
        description="Encontre a serventia pelo estado, município e atribuição, com endereço e telefone registrados."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Estado" value={uf} onChange={(e) => setUf(e.target.value)} placeholder="Escolha o estado" options={states} />
        <Select
          label="Município"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={uf ? "Escolha o município" : "Escolha o estado antes"}
          options={cities}
          disabled={!uf}
        />
        <Select label="Atribuição" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {!uf || !city ? (
        <p className="text-sm text-neutral-500">Escolha o estado e o município para ver os cartórios.</p>
      ) : loading ? (
        <p className="text-sm text-neutral-500">Consultando cartórios…</p>
      ) : cartorios.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum cartório registrado para {city}/{uf} nesta atribuição. A equipe localiza a serventia no pedido.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:w-80">
              <Input placeholder="Filtrar por nome, atribuição ou CNS" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filtrar cartórios" />
            </div>
            <p className="text-xs text-neutral-500">
              {visible.length} cartório(s) · {withContact} com endereço ou telefone registrado
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visible.map((item) => (
              <li key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-0 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.attribution}
                      {item.cns ? ` · CNS ${item.cns}` : ""}
                    </p>
                  </div>
                </div>
                <p className="flex items-start gap-2 text-sm text-neutral-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                  {item.address ? `${item.address} · ${item.city}/${item.state}` : <span className="text-neutral-400">Endereço não registrado</span>}
                </p>
                <p className="flex items-center gap-2 text-sm text-neutral-700">
                  <Phone className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                  {item.phone ? (
                    <a href={`tel:${item.phone.replace(/\D/g, "")}`} className="hover:underline">
                      {item.phone}
                    </a>
                  ) : (
                    <span className="text-neutral-400">Telefone não registrado</span>
                  )}
                </p>
                {item.email && (
                  <p className="flex items-center gap-2 text-sm text-neutral-700">
                    <Mail className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                    <a href={`mailto:${item.email}`} className="break-all hover:underline">
                      {item.email}
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
