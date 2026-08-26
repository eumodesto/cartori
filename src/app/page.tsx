"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { CertificateCategory, CertificateTypeConfig, IBGEState, IBGECity, CartorioInfo } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Search,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  MapPin,
  HelpCircle,
  Lock,
  Download,
  Users,
} from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Interactive Demo Modal / Quick Selector State
  const [selectedCert, setSelectedCert] = useState<CertificateTypeConfig | null>(null);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>("");
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cartorios, setCartorios] = useState<CartorioInfo[]>([]);
  const [selectedCartorio, setSelectedCartorio] = useState<string>("");
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingCartorios, setLoadingCartorios] = useState<boolean>(false);

  // Carrega estados do IBGE na montagem
  useEffect(() => {
    fetch("/api/locations/states")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStates(data.states);
      })
      .catch((err) => console.error(err));
  }, []);

  // Quando o estado muda, busca as cidades do IBGE
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

  // Quando a cidade muda, busca os cartórios daquela comarca
  useEffect(() => {
    if (!selectedUf || !selectedCity || !selectedCert) {
      setCartorios([]);
      return;
    }

    setLoadingCartorios(true);
    fetch(`/api/cartorios?uf=${selectedUf}&city=${encodeURIComponent(selectedCity)}&category=${selectedCert.category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCartorios(data.cartorios);
        setLoadingCartorios(false);
      })
      .catch(() => setLoadingCartorios(false));
  }, [selectedUf, selectedCity, selectedCert]);

  const filteredCertificates = MVP_CERTIFICATES.filter((cert) => {
    const matchesCategory = selectedCategory === "all" || cert.category === selectedCategory;
    const matchesSearch =
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-white py-16 lg:py-24 overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-amber-500/10 to-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300">
                <Building2 className="w-3.5 h-3.5" />
                <span>Plataforma SaaS para Advogados, Imobiliárias e Empresas</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-serif">
                Emita certidões de todo o Brasil em um{" "}
                <span className="text-amber-400 underline decoration-amber-400/40 decoration-4">
                  único pedido
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Centralize suas solicitações de Registro Civil, Imóveis, Notas e Protesto. Selecione o estado, cidade e cartório com preenchimento automático e pague tudo consolidado via Mercado Pago.
              </p>

              {/* Quick Search */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 text-slate-900">
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Qual certidão você precisa? Ex: Nascimento, Testamento, Imóvel..."
                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                  <a
                    href="#certidoes"
                    className="bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow shrink-0"
                  >
                    Buscar
                  </a>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Carrinho Multi-Itens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Integração IBGE & Cartórios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>PIX Instantâneo Mercado Pago</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card / SaaS Multi-item preview */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl text-left space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Pedido Consolidado (Exemplo)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                    B2B & B2C
                  </span>
                </div>

                {/* Simulated Cart Items */}
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Certidão de Nascimento</p>
                      <p className="text-[11px] text-slate-300">São Paulo / SP • 1º Subdistrito</p>
                    </div>
                    <span className="font-bold text-amber-300">R$ 129,90</span>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Negativa de Testamento</p>
                      <p className="text-[11px] text-slate-300">Nacional • Central CENSEC</p>
                    </div>
                    <span className="font-bold text-amber-300">R$ 119,90</span>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Matrícula de Imóvel</p>
                      <p className="text-[11px] text-slate-300">Rio de Janeiro / RJ • 5º RGI</p>
                    </div>
                    <span className="font-bold text-amber-300">R$ 189,90</span>
                  </div>
                </div>

                {/* Total and CTA */}
                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total do Pedido (3 Certidões)</span>
                    <span className="text-xl font-extrabold text-white">R$ 439,70</span>
                  </div>
                  <a
                    href="#certidoes"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
                  >
                    <span>Montar Pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Dynamic Request Section */}
      <section id="certidoes" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Catálogo de Serviços
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Selecione a Certidão Desejada
            </h2>
            <p className="text-sm text-slate-600">
              Escolha o tipo de certidão para configurar a localização (Estado, Cidade e Cartório) e dados do documento.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: "all", label: "Todas as Certidões" },
                { id: "registro-civil", label: "Registro Civil" },
                { id: "notas", label: "Tabelionato de Notas" },
                { id: "imoveis", label: "Registro de Imóveis" },
                { id: "protesto", label: "Protesto de Títulos" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary-800 text-white shadow"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Certificate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-primary-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                      {cert.categoryName}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {cert.estimatedDays}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-800 transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cert.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">A partir de</span>
                    <span className="text-lg font-black text-primary-900">
                      {formatCurrency(cert.basePrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCert(cert);
                      setSelectedUf("");
                      setSelectedCity("");
                      setCartorios([]);
                    }}
                    className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-800 text-primary-800 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-primary-200"
                  >
                    <span>Solicitar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Location & Cart Demo Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-primary-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Configuração Notarial • {selectedCert.categoryName}
                </span>
                <h3 className="text-xl font-bold font-serif">{selectedCert.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-300 hover:text-white text-lg font-bold p-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Location APIS */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-700" />
                  <span>1. Local de Emissão (Integração IBGE & Cartórios)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select UF */}
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
                    }}
                    required
                  />

                  {/* Select City */}
                  <SearchableSelect
                    label="Cidade / Município"
                    placeholder={!selectedUf ? "Primeiro selecione o Estado" : "Selecione ou digite a Cidade..."}
                    options={cities.map((c) => ({
                      value: c.nome,
                      label: c.nome,
                    }))}
                    value={selectedCity}
                    disabled={!selectedUf}
                    loading={loadingCities}
                    loadingText="Carregando municípios do IBGE..."
                    emptyText="Nenhum município encontrado"
                    onChange={(val) => {
                      setSelectedCity(val);
                      setSelectedCartorio("");
                    }}
                    required
                  />
                </div>

                {/* Cartorio Selector if requiresCartorio */}
                {selectedCert.requiresCartorio && selectedCity && (
                  <div className="pt-2">
                    <SearchableSelect
                      label="Cartório / Serventia Oficial"
                      rightBadge={
                        cartorios.length > 0 ? (
                          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                            {cartorios.length} serventias oficiais encontradas
                          </span>
                        ) : undefined
                      }
                      placeholder="Digite o nome do cartório, bairro ou subdistrito..."
                      options={[
                        ...cartorios.map((c) => ({
                          value: c.id,
                          label: c.name,
                          subtext: c.attribution,
                          badge: c.cns ? `CNS: ${c.cns}` : undefined,
                        })),
                        {
                          value: "unknown",
                          label: "🔍 Não sei o cartório (Solicitar Busca Notarial Especializada)",
                          subtext: "Nossa equipe de despachantes localizará a serventia exata",
                          badge: "+ R$ 35,00",
                          highlight: true,
                        },
                      ]}
                      value={selectedCartorio}
                      loading={loadingCartorios}
                      loadingText="Consultando serventias registradas no CNJ..."
                      emptyText="Nenhum cartório encontrado"
                      onChange={(val) => setSelectedCartorio(val)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Document Fields Preview */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-700" />
                  <span>2. Dados do Documento</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCert.fields.slice(0, 4).map((f) => (
                    <div key={f.id}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {f.label} {f.required && "*"}
                      </label>
                      <input
                        type={f.type === "date" ? "date" : "text"}
                        placeholder={f.placeholder}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-primary-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Valor da Certidão</span>
                  <span className="text-xl font-black text-primary-900">
                    {formatCurrency(selectedCert.basePrice)}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      alert("Certidão adicionada ao pedido com sucesso! Você pode incluir mais certidões ou finalizar.");
                      setSelectedCert(null);
                    }}
                    className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold text-xs px-6 py-3 rounded-xl shadow transition-all"
                  >
                    + Adicionar ao Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B2B Section for Lawyers & Real Estate */}
      <section id="b2b" className="py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Solução B2B Corporativa
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-serif">
                Desenvolvido para Escritórios de Advocacia e Imobiliárias
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Agilize due diligences, inventários, ações judiciais e transações imobiliárias. Solicite dezenas de certidões em lote, vincule ao número do processo ou imóvel e faça o download em um só repositório.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Gestão por Processo / Imóvel</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Etiquete cada certidão com o código interno do seu cliente para facilitar a prestação de contas.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Repositório Digital Central</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Todas as e-certidões emitidas ficam salvas permanentemente no painel do seu escritório.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Pagamento Seguro Mercado Pago</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gere cobrança única por PIX ou Cartão para todas as certidões solicitadas.
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Múltiplos Usuários</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Advogados associados, estagiários e corretores solicitam dentro da mesma conta corporativa.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-primary-800 to-primary-900 p-8 rounded-3xl border border-white/15 shadow-2xl text-center space-y-6">
              <div className="w-14 h-14 bg-amber-400 text-primary-950 rounded-2xl flex items-center justify-center mx-auto font-black shadow-lg">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif">Comece a emitir certidões hoje</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sem mensalidades fixas. Pague apenas pelas certidões solicitadas com suporte prioritário.
              </p>
              <a
                href="#certidoes"
                className="block w-full bg-amber-400 hover:bg-amber-300 text-primary-950 font-bold text-sm py-3.5 rounded-xl shadow transition-all"
              >
                Fazer Meu Primeiro Pedido
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
