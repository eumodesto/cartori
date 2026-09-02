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
import {
  isFieldVisible,
  isPricedOptionAvailable,
  lookupPricedAmount,
  sortDocumentFields,
} from "@/lib/field-visibility";
import {
  INTEIRO_TEOR_BOTH_EXPLANATION,
  inteiroTeorRadioOptions,
  isInteiroTeorBoth,
} from "@/lib/inteiro-teor";
import { expandInteiroTeorCartItems, apostillePriceFor, listPriceFor, priceCertificate } from "@/lib/pricing";
import {
  CartItem,
  CertificateFormat,
  CertificateTypeConfig,
  CartorioInfo,
  FormFieldDefinition,
  IBGECity,
  IBGEState,
} from "@/lib/types";
import { createId, formatCurrency } from "@/lib/utils";

const ABROAD_FIELD_IDS = new Set(["traducao-juramentada", "apostilamento_traduzida"]);

interface CertificateConfigDialogProps {
  certificate: CertificateTypeConfig;
  onClose: () => void;
  onAdd: (items: CartItem[]) => void;
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
  const [wantsTranslation, setWantsTranslation] = useState(false);
  const [referenceTag, setReferenceTag] = useState("");
  const [error, setError] = useState("");
  const [docCities, setDocCities] = useState<IBGECity[]>([]);
  const [loadingDocCities, setLoadingDocCities] = useState(false);

  const isUnknownCartorio = selectedCartorio === "unknown";
  const needsIbgeFields = certificate.fields.some(
    (field) => field.dataSource === "ibge-uf" || field.dataSource === "ibge-city"
  );

  const fieldContext = {
    documentData,
    format,
    uf: selectedUf,
  };

  const fieldIsVisible = (field: FormFieldDefinition) =>
    isFieldVisible(field, fieldContext);

  const translationField = certificate.fields.find((field) => field.id === "traducao-juramentada");
  const translationVisible = Boolean(translationField && fieldIsVisible(translationField));
  const apostilleTraduzidaField = certificate.fields.find(
    (field) => field.id === "apostilamento_traduzida"
  );

  const extraSuffix = (priced?: { price?: number; priceByUf?: Record<string, number> }) => {
    const amount = lookupPricedAmount(priced, selectedUf);
    return amount > 0 ? ` (+ ${formatCurrency(amount)})` : "";
  };

  const optionsForField = (field: FormFieldDefinition) => {
    const options = (field.options || []).filter((option) => option.value && option.value !== "nao");
    if (field.id === "inteiro_teor") {
      return inteiroTeorRadioOptions(field, selectedUf, extraSuffix);
    }
    return options.map((option) => ({
      ...option,
      label: `${option.label}${extraSuffix(option)}`,
    }));
  };

  const renderField = (field: FormFieldDefinition) => {
    const pricedOptions = optionsForField(field);
    if (field.id === "inteiro_teor" && pricedOptions.length === 0) {
      return null;
    }

    if (field.dataSource === "ibge-uf") {
      return (
        <SearchableSelect
          key={field.id}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder || "Selecione ou digite o Estado..."}
          options={states.map((st) => ({
            value: st.sigla,
            label: `${st.nome} (${st.sigla})`,
            badge: st.sigla,
          }))}
          value={documentData[field.id] || ""}
          onChange={(value) => {
            setField(field.id, value);
            if (field.id === "state") setField("city", "");
            if (field.id === "cep_uf") setField("cep_cidade", "");
          }}
        />
      );
    }

    if (field.dataSource === "ibge-city") {
      const ufReady = Boolean(documentUf);
      return (
        <SearchableSelect
          key={field.id}
          label={field.label}
          required={field.required}
          placeholder={
            !ufReady
              ? "Primeiro selecione o Estado"
              : field.placeholder || "Selecione ou digite o Município..."
          }
          options={docCities.map((city) => ({
            value: city.nome,
            label: city.nome,
          }))}
          value={documentData[field.id] || ""}
          disabled={!ufReady}
          loading={loadingDocCities}
          loadingText="Carregando municípios do IBGE..."
          emptyText="Nenhum município encontrado"
          onChange={(value) => setField(field.id, value)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <Select
          key={field.id}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder || "Selecione"}
          options={pricedOptions}
          value={documentData[field.id] || ""}
          onChange={(event) => setField(field.id, event.target.value)}
        />
      );
    }

    if (field.type === "radio" || field.id === "inteiro_teor") {
      return (
        <div key={field.id} className="sm:col-span-2">
          <RadioGroup
            name={field.id}
            label={`${field.id === "inteiro_teor" ? "Inteiro teor" : field.label}${field.required ? " *" : ""}`}
            value={documentData[field.id] || ""}
            onChange={(value) => setField(field.id, value)}
            allowDeselect={!field.required}
            helperText={
              field.id === "inteiro_teor" && !isInteiroTeorBoth(documentData[field.id])
                ? "Opcional. Não selecione se não precisar."
                : undefined
            }
            options={pricedOptions.map((option) => ({
              value: option.value,
              label: option.label,
              description:
                "description" in option && typeof option.description === "string"
                  ? option.description
                  : undefined,
            }))}
          />
          {field.id === "inteiro_teor" && isInteiroTeorBoth(documentData[field.id]) ? (
            <p className="mt-2 text-sm text-slate-700 bg-brand-50/70 border border-brand-200 rounded-md p-3 leading-relaxed">
              {INTEIRO_TEOR_BOTH_EXPLANATION}
            </p>
          ) : null}
        </div>
      );
    }

    if (field.type === "checkbox" && field.id !== "inteiro_teor") {
      return (
        <div key={field.id} className="sm:col-span-2 rounded-md border border-neutral-200 p-3">
          <Checkbox
            checked={documentData[field.id] === "true"}
            onChange={(event) =>
              setField(field.id, event.target.checked ? "true" : "false")
            }
            label={`${field.label}${extraSuffix(field)}${field.required ? " *" : ""}`}
          />
        </div>
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
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        placeholder={field.placeholder}
        helperText={field.helperText}
        value={documentData[field.id] || ""}
        onChange={(event) => setField(field.id, event.target.value)}
      />
    );
  };

  const selectedState = states.find((state) => state.sigla === selectedUf);
  const selectedCartorioInfo = cartorios.find((item) => item.id === selectedCartorio);

  const usesUfTable =
    certificate.priceMode === "uf-format" || certificate.priceMode === "uf-flat";

  const pricing = useMemo(
    () =>
      priceCertificate(certificate, {
        format,
        isUnknownCartorio,
        hasApostille,
        uf: selectedUf,
        documentData,
      }),
    [certificate, format, isUnknownCartorio, hasApostille, selectedUf, documentData]
  );

  const issuanceItems = useMemo(
    () =>
      expandInteiroTeorCartItems(certificate, {
        id: "preview",
        certificateTypeSlug: certificate.slug,
        certificateName: certificate.name,
        category: certificate.category,
        categoryName: certificate.categoryName,
        state: selectedUf,
        stateName: selectedState?.nome || selectedUf,
        city: selectedCity,
        cartorioId: selectedCartorioInfo?.id,
        cartorioName: selectedCartorioInfo?.name,
        isUnknownCartorio,
        documentData,
        format,
        hasApostille,
        hasShipping: false,
        basePrice: 0,
        searchFee: 0,
        apostillePrice: 0,
        shippingPrice: 0,
        itemTotal: 0,
        referenceTag: referenceTag.trim() || undefined,
      }),
    [
      certificate,
      documentData,
      format,
      hasApostille,
      isUnknownCartorio,
      referenceTag,
      selectedCartorioInfo?.id,
      selectedCartorioInfo?.name,
      selectedCity,
      selectedState?.nome,
      selectedUf,
    ]
  );

  const previewTotal = issuanceItems.reduce((sum, item) => sum + item.itemTotal, 0);

  const digitalList = listPriceFor(certificate, "DIGITAL_ECERTIDAO", selectedUf);
  const paperList = listPriceFor(certificate, "PHYSICAL_PAPER", selectedUf);
  const bothList = listPriceFor(certificate, "BOTH", selectedUf);
  const apostilleAmount = apostillePriceFor(certificate, selectedUf);

  useEffect(() => {
    if (!certificate.requiresCartorio && !needsIbgeFields) return;
    fetch("/api/locations/states")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStates(data.states);
      })
      .catch(() => undefined);
  }, [certificate.requiresCartorio, needsIbgeFields]);

  const documentUf = documentData.state || documentData.cep_uf || "";

  useEffect(() => {
    if (!certificate.fields.some((field) => field.dataSource === "ibge-city")) {
      return;
    }
    if (!documentUf) {
      setDocCities([]);
      return;
    }
    setLoadingDocCities(true);
    fetch(`/api/locations/cities?uf=${documentUf}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDocCities(data.cities);
        setLoadingDocCities(false);
      })
      .catch(() => setLoadingDocCities(false));
  }, [certificate.fields, documentUf]);

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

  useEffect(() => {
    setDocumentData((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const field of certificate.fields) {
        const current = String(next[field.id] || "");
        if (!current) continue;
        const visible = isFieldVisible(field, {
          documentData: prev,
          format,
          uf: selectedUf,
        });
        if (!visible) {
          delete next[field.id];
          changed = true;
          continue;
        }
        if (field.type === "select" || field.type === "radio" || field.id === "inteiro_teor") {
          if (field.id === "inteiro_teor") {
            const allowed = inteiroTeorRadioOptions(field, selectedUf, () => "").map(
              (option) => option.value
            );
            if (!allowed.includes(current)) {
              delete next[field.id];
              changed = true;
            }
            continue;
          }
          const allowed = (field.options || []).filter((option) =>
            isPricedOptionAvailable(option, selectedUf)
          );
          if (!allowed.some((option) => option.value === current)) {
            delete next[field.id];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [certificate.fields, format, selectedUf, documentData]);

  useEffect(() => {
    if (format === "DIGITAL_ECERTIDAO") setWantsTranslation(false);
  }, [format]);

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

    const translationField = certificate.fields.find((field) => field.id === "traducao-juramentada");
    if (
      translationField &&
      fieldIsVisible(translationField) &&
      wantsTranslation &&
      !String(documentData["traducao-juramentada"] || "").trim()
    ) {
      setError("Selecione o idioma da tradução juramentada.");
      return;
    }

    for (const field of certificate.fields) {
      if (!fieldIsVisible(field) || !field.required) continue;
      if (field.type === "checkbox") {
        if (documentData[field.id] !== "true") {
          setError(`Marque o campo "${field.label}".`);
          return;
        }
        continue;
      }
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
        : certificate.categoryName,
      isUnknownCartorio: certificate.requiresCartorio ? isUnknownCartorio : false,
      documentData,
      format,
      hasApostille,
      hasShipping: pricing.shippingPrice > 0,
      basePrice: pricing.basePrice,
      searchFee: pricing.searchFee,
      apostillePrice: pricing.apostillePrice,
      extrasPrice: pricing.extrasPrice,
      shippingPrice: pricing.shippingPrice,
      itemTotal: pricing.itemTotal,
      referenceTag: referenceTag.trim() || undefined,
    };

    onAdd(expandInteiroTeorCartItems(certificate, item));
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
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {certificate.requiresCartorio ? "2." : "1."} Formato da certidão
            </h4>

            <RadioGroup
              name="format"
              label="Formato da certidão"
              value={format}
              onChange={(value) => setFormat(value as CertificateFormat)}
              options={[
                {
                  value: "DIGITAL_ECERTIDAO",
                  label: `E-certidão digital — ${formatCurrency(digitalList)}`,
                  description: usesUfTable && !selectedUf
                    ? "Selecione o estado para o preço da tabela UF."
                    : "PDF com assinatura ICP-Brasil, sem frete.",
                },
                ...(certificate.hasShippingOption
                  ? [
                      {
                        value: "PHYSICAL_PAPER",
                        label: `Papel moeda — ${formatCurrency(paperList)} + frete ${formatCurrency(certificate.shippingPrice)}`,
                        description: "Via física enviada pelos Correios.",
                      },
                      {
                        value: "BOTH",
                        label: `Digital + físico — ${formatCurrency(bothList)} + frete ${formatCurrency(certificate.shippingPrice)}`,
                        description: "PDF imediato após emissão e via em papel.",
                      },
                    ]
                  : []),
              ]}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-700" />
              <span>
                {certificate.requiresCartorio ? "3." : "2."} Dados do documento
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortDocumentFields(
                certificate.fields.filter(
                  (field) => fieldIsVisible(field) && !ABROAD_FIELD_IDS.has(field.id)
                )
              ).map((field) => renderField(field))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {certificate.requiresCartorio ? "4." : "3."} Uso no exterior
            </h4>

            {certificate.hasApostilleOption && (
              <div className="rounded-md border border-neutral-200 p-3">
                <Checkbox
                  checked={hasApostille}
                  onChange={(event) => setHasApostille(event.target.checked)}
                  label={`Apostila de Haia na certidão original (+ ${formatCurrency(apostilleAmount)})`}
                  description="Autentica a via em português para países da Convenção de Haia. Não traduz o documento."
                />
              </div>
            )}

            {certificate.fields.some((field) => field.id === "traducao-juramentada") &&
              format === "DIGITAL_ECERTIDAO" && (
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Os idiomas (inglês, espanhol, italiano e outros) entram na tradução
                  juramentada, cobrada à parte. Para traduzir, escolha papel moeda ou
                  digital + físico.
                </p>
              )}

            {translationVisible && translationField && (
              <div className="space-y-3">
                <div className="rounded-md border border-neutral-200 p-3">
                  <Checkbox
                    checked={wantsTranslation}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setWantsTranslation(enabled);
                      setError("");
                      if (!enabled) {
                        setDocumentData((prev) => {
                          const next = { ...prev };
                          delete next["traducao-juramentada"];
                          delete next["apostilamento_traduzida"];
                          return next;
                        });
                      }
                    }}
                    label="Tradução juramentada"
                    description="Traduz o texto da certidão para o idioma escolhido. A Apostila de Haia não traduz."
                  />
                </div>
                {wantsTranslation && (
                  <Select
                    label="Idioma"
                    required
                    placeholder="Selecione o idioma"
                    helperText="Valor da tradução juramentada no idioma escolhido."
                    options={optionsForField(translationField)}
                    value={documentData["traducao-juramentada"] || ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDocumentData((prev) => {
                        const next: Record<string, string> = {
                          ...prev,
                          "traducao-juramentada": value,
                        };
                        if (!value) delete next.apostilamento_traduzida;
                        return next;
                      });
                      setError("");
                    }}
                  />
                )}
                {wantsTranslation &&
                  apostilleTraduzidaField &&
                  fieldIsVisible(apostilleTraduzidaField) && (
                    <div className="rounded-md border border-neutral-200 p-3">
                      <Checkbox
                        checked={documentData["apostilamento_traduzida"] === "true"}
                        onChange={(event) =>
                          setField(
                            "apostilamento_traduzida",
                            event.target.checked ? "true" : "false"
                          )
                        }
                        label={`Apostila de Haia na certidão traduzida${extraSuffix(apostilleTraduzidaField)}`}
                        description="Autentica a via traduzida para países da Convenção de Haia. É cobrada à parte da apostila da via original."
                      />
                    </div>
                  )}
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
              {issuanceItems.length > 1 ? "Valor das duas certidões" : "Valor deste item"}
            </span>
            <span className="text-xl font-black text-primary-900">
              {formatCurrency(previewTotal)}
            </span>
            {previewTotal > 300 && (
              <p className="text-xs font-medium text-brand-700 mt-0.5">
                Pode dividir em até 10x no cartão
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-[16rem]">
              {issuanceItems.length > 1
                ? "Duas emissões do mesmo registro: transcrita e reprográfica. "
                : ""}
              {usesUfTable && selectedUf
                ? `Lista ${selectedUf}: ${formatCurrency(issuanceItems.reduce((sum, item) => sum + item.basePrice, 0))}`
                : `Lista: ${formatCurrency(issuanceItems.reduce((sum, item) => sum + item.basePrice, 0))}`}
              {issuanceItems.some((item) => item.searchFee > 0)
                ? ` · busca ${formatCurrency(issuanceItems.reduce((sum, item) => sum + item.searchFee, 0))}`
                : ""}
              {issuanceItems.some((item) => (item.extrasPrice || 0) > 0)
                ? ` · extras ${formatCurrency(issuanceItems.reduce((sum, item) => sum + (item.extrasPrice || 0), 0))}`
                : ""}
              {issuanceItems.some((item) => item.apostillePrice > 0)
                ? ` · apostila ${formatCurrency(issuanceItems.reduce((sum, item) => sum + item.apostillePrice, 0))}`
                : ""}
              {issuanceItems.some((item) => item.shippingPrice > 0)
                ? ` · frete ${formatCurrency(issuanceItems.reduce((sum, item) => sum + item.shippingPrice, 0))}`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAdd}>
              {issuanceItems.length > 1
                ? "+ Adicionar 2 certidões ao pedido"
                : "+ Adicionar ao pedido"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
