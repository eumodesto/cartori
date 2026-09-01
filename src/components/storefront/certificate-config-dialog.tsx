"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, MapPin, Tag } from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priceCertificate } from "@/lib/pricing";
import {
  CartItem,
  CertificateFormat,
  CertificateTypeConfig,
  CartorioInfo,
  IBGECity,
  IBGEState,
} from "@/lib/types";
import { createId, formatCurrency } from "@/lib/utils";

interface CertificateConfigDialogProps {
  certificate: CertificateTypeConfig;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export function CertificateConfigDialog({
  certificate,
  onClose,
  onAdd,
}: CertificateConfigDialogProps) {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [selectedUf, setSelectedUf] = useState("");
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [cartorios, setCartorios] = useState<CartorioInfo[]>([]);
  const [selectedCartorio, setSelectedCartorio] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCartorios, setLoadingCartorios] = useState(false);
  const [documentData, setDocumentData] = useState<Record<string, string>>({});
  const [format, setFormat] = useState<CertificateFormat>("DIGITAL_ECERTIDAO");
  const [hasApostille, setHasApostille] = useState(false);
  const [referenceTag, setReferenceTag] = useState("");
  const [error, setError] = useState("");

  const isUnknownCartorio = selectedCartorio === "unknown";
  const selectedState = states.find((state) => state.sigla === selectedUf);
  const selectedCartorioInfo = cartorios.find((item) => item.id === selectedCartorio);

  const pricing = useMemo(
    () =>
      priceCertificate(certificate, {
        format,
        isUnknownCartorio,
        hasApostille,
      }),
    [certificate, format, isUnknownCartorio, hasApostille]
  );

  useEffect(() => {
    if (!certificate.requiresCartorio) return;
    fetch("/api/locations/states")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStates(data.states);
      })
      .catch(() => undefined);
  }, [certificate.requiresCartorio]);

  useEffect(() => {
    if (!selectedUf) {
      setCities([]);
      setSelectedCity("");
      return;
    }

    setLoadingCities(true);
    fetch(`/api/locations/cities?uf=${selectedUf}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCities(data.cities);
        setLoadingCities(false);
      })
      .catch(() => setLoadingCities(false));
  }, [selectedUf]);

  useEffect(() => {
    if (!certificate.requiresCartorio || !selectedUf || !selectedCity) {
      setCartorios([]);
      return;
    }

    setLoadingCartorios(true);
    fetch(
      `/api/cartorios?uf=${selectedUf}&city=${encodeURIComponent(selectedCity)}&category=${certificate.category}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCartorios(data.cartorios);
        setLoadingCartorios(false);
      })
      .catch(() => setLoadingCartorios(false));
  }, [certificate.category, certificate.requiresCartorio, selectedCity, selectedUf]);

  const setField = (id: string, value: string) => {
    setDocumentData((prev) => ({ ...prev, [id]: value }));
    setError("");
  };

  const handleAdd = () => {
    if (certificate.requiresCartorio) {
      if (!selectedUf || !selectedCity) {
        setError("Selecione estado e cidade da serventia.");
        return;
      }
      if (!selectedCartorio) {
        setError("Selecione o cartório ou peça a busca especializada.");
        return;
      }
    }

    for (const field of certificate.fields) {
      if (!field.required) continue;
      if (!String(documentData[field.id] || "").trim()) {
        setError(`Preencha o campo "${field.label}".`);
        return;
      }
    }

    const item: CartItem = {
      id: createId(),
      certificateTypeSlug: certificate.slug,
      certificateName: certificate.name,
      category: certificate.category,
      categoryName: certificate.categoryName,
      state: certificate.requiresCartorio ? selectedUf : "BR",
      stateName: certificate.requiresCartorio
        ? selectedState?.nome || selectedUf
        : "Nacional",
      city: certificate.requiresCartorio ? selectedCity : "Brasil",
      cartorioId: isUnknownCartorio ? undefined : selectedCartorioInfo?.id,
      cartorioName: certificate.requiresCartorio
        ? isUnknownCartorio
          ? "Busca especializada de serventia"
          : selectedCartorioInfo?.name
        : "CENSEC — Colégio Notarial do Brasil",
      isUnknownCartorio: certificate.requiresCartorio ? isUnknownCartorio : false,
      documentData,
      format,
      hasApostille: pricing.apostillePrice > 0,
      hasShipping: pricing.shippingPrice > 0,
      basePrice: pricing.basePrice,
      searchFee: pricing.searchFee,
      apostillePrice: pricing.apostillePrice,
      shippingPrice: pricing.shippingPrice,
      itemTotal: pricing.itemTotal,
      referenceTag: referenceTag.trim() || undefined,
    };

    onAdd(item);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-primary-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Configuração Notarial • {certificate.categoryName}
            </span>
            <h3 className="text-xl font-bold font-serif">{certificate.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white text-lg font-bold p-2"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {certificate.requiresCartorio && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-700" />
                <span>1. Local de emissão</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="Estado (UF)"
                  placeholder="Selecione ou digite o Estado..."
                  options={states.map((st) => ({
                    value: st.sigla,
                    label: `${st.nome} (${st.sigla})`,
                    badge: st.sigla,
                  }))}
                  value={selectedUf}
                  onChange={(val) => {
                    setSelectedUf(val);
                    setSelectedCity("");
                    setSelectedCartorio("");
                    setError("");
                  }}
                  required
                />

                <SearchableSelect
                  label="Cidade / Município"
                  placeholder={
                    !selectedUf
                      ? "Primeiro selecione o Estado"
                      : "Selecione ou digite a Cidade..."
                  }
                  options={cities.map((city) => ({
                    value: city.nome,
                    label: city.nome,
                  }))}
                  value={selectedCity}
                  disabled={!selectedUf}
                  loading={loadingCities}
                  loadingText="Carregando municípios do IBGE..."
                  emptyText="Nenhum município encontrado"
                  onChange={(val) => {
                    setSelectedCity(val);
                    setSelectedCartorio("");
                    setError("");
                  }}
                  required
                />
              </div>

              {selectedCity && (
                <SearchableSelect
                  label="Cartório / Serventia oficial"
                  rightBadge={
                    cartorios.length > 0 ? (
                      <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        {cartorios.length} serventias encontradas
                      </span>
                    ) : undefined
                  }
                  placeholder="Digite o nome do cartório, bairro ou subdistrito..."
                  options={[
                    ...cartorios.map((cartorio) => ({
                      value: cartorio.id,
                      label: cartorio.name,
                      subtext: cartorio.attribution,
                      badge: cartorio.cns ? `CNS: ${cartorio.cns}` : undefined,
                    })),
                    {
                      value: "unknown",
                      label: "Não sei o cartório (busca especializada)",
                      subtext: "A equipe localiza a serventia exata",
                      badge: certificate.hasSearchFee
                        ? `+ ${formatCurrency(certificate.searchFee)}`
                        : undefined,
                      highlight: true,
                    },
                  ]}
                  value={selectedCartorio}
                  loading={loadingCartorios}
                  loadingText="Consultando serventias..."
                  emptyText="Nenhum cartório encontrado"
                  onChange={(val) => {
                    setSelectedCartorio(val);
                    setError("");
                  }}
                  required
                />
              )}
            </div>
          )}

          <div
            className={`space-y-4 ${
              certificate.requiresCartorio ? "pt-4 border-t border-slate-100" : ""
            }`}
          >
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-700" />
              <span>
                {certificate.requiresCartorio ? "2." : "1."} Dados do documento
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificate.fields.map((field) => {
                if (field.type === "select") {
                  return (
                    <Select
                      key={field.id}
                      label={field.label}
                      required={field.required}
                      placeholder={field.placeholder || "Selecione"}
                      options={field.options || []}
                      value={documentData[field.id] || ""}
                      onChange={(event) => setField(field.id, event.target.value)}
                    />
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.id} className="sm:col-span-2">
                      <Textarea
                        label={field.label}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={documentData[field.id] || ""}
                        onChange={(event) => setField(field.id, event.target.value)}
                      />
                    </div>
                  );
                }

                return (
                  <Input
                    key={field.id}
                    label={field.label}
                    required={field.required}
                    type={field.type === "date" ? "date" : "text"}
                    placeholder={field.placeholder}
                    helperText={field.helperText}
                    value={documentData[field.id] || ""}
                    onChange={(event) => setField(field.id, event.target.value)}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {certificate.requiresCartorio ? "3." : "2."} Formato e adicionais
            </h4>

            <RadioGroup
              name="format"
              label="Formato da certidão"
              value={format}
              onChange={(value) => setFormat(value as CertificateFormat)}
              options={[
                {
                  value: "DIGITAL_ECERTIDAO",
                  label: "E-certidão digital",
                  description: "PDF com assinatura ICP-Brasil, sem frete.",
                },
                ...(certificate.hasShippingOption
                  ? [
                      {
                        value: "PHYSICAL_PAPER",
                        label: `Papel moeda (+ ${formatCurrency(certificate.shippingPrice)})`,
                        description: "Via física enviada pelos Correios.",
                      },
                      {
                        value: "BOTH",
                        label: `Digital + físico (+ ${formatCurrency(certificate.shippingPrice)})`,
                        description: "PDF imediato após emissão e via em papel.",
                      },
                    ]
                  : []),
              ]}
            />

            {certificate.hasApostilleOption && (
              <div className="rounded-md border border-neutral-200 p-3">
                <Checkbox
                  checked={hasApostille}
                  onChange={(event) => setHasApostille(event.target.checked)}
                  label={`Apostilamento de Haia (+ ${formatCurrency(certificate.apostillePrice)})`}
                  description="Para uso da certidão no exterior."
                />
              </div>
            )}

            <Input
              label="Referência interna (opcional)"
              placeholder="Processo, imóvel, cliente..."
              leftIcon={<Tag className="w-4 h-4" />}
              value={referenceTag}
              onChange={(event) => setReferenceTag(event.target.value)}
              helperText="Aparece no pedido para prestação de contas do escritório."
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-semantic-error">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">
              Valor deste item
            </span>
            <span className="text-xl font-black text-primary-900">
              {formatCurrency(pricing.itemTotal)}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAdd}>
              + Adicionar ao pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
