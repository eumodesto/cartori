"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconBar } from "@/components/ui/icon-bar";
import { MetricCard } from "@/components/cartori/metric-card";
import { AttentionPanel, AttentionItem } from "@/components/cartori/attention-panel";
import { DeadlineList } from "@/components/cartori/deadline-list";
import { RequestStatus } from "@/components/cartori/request-status";
import { RequestTimeline, TimelineEvent } from "@/components/cartori/request-timeline";
import { CartorialLifecycle } from "@/components/cartori/cartorial-lifecycle";
import { GlossaryModal } from "@/components/cartori/glossary-modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
} from "@/components/ui/sheet";
import {
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  HelpCircle,
  BookOpen,
  FileCheck2,
  Sparkles,
  Layers,
  FileUp,
  Landmark,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"all" | "attention" | "processing" | "completed">("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRequestDetails, setSelectedRequestDetails] = React.useState<any | null>(null);
  const [resolvingItem, setResolvingItem] = React.useState<AttentionItem | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  // Exigências operacionais reais
  const attentionItems: AttentionItem[] = [
    {
      id: "att-1",
      protocol: "#CRT-9102",
      title: "Exigência de Certidão de Casamento com Averbação",
      description:
        "O 1º Oficial de Registro de Imóveis de SP solicitou certidão de casamento atualizada do vendedor para averbar a alteração de estado civil na matrícula.",
      cartorio: "1º Oficial de Registro de Imóveis da Capital (SP)",
      urgency: "high",
      timeElapsed: "Há 2 horas",
      deadlineDate: "12/09/2026 (Restam 14 dias de prenotação)",
      instruction:
        "Anexe o PDF da Certidão de Casamento com averbação de divórcio emitida há menos de 90 dias.",
    },
    {
      id: "att-2",
      protocol: "#CRT-9088",
      title: "Diligência de Localização de Assento Antigo",
      description:
        "O 3º Subdistrito de Registro Civil solicitou informar o nome dos avós maternos para refinar a busca no livro manual de 1968.",
      cartorio: "3º Subdistrito de Registro Civil - Penha de França (SP)",
      urgency: "medium",
      timeElapsed: "Há 5 horas",
      deadlineDate: "Sem cancelamento imediato",
      instruction:
        "Confirme a filiação completa dos genitores ou anexe certidão de batismo/identidade antiga.",
    },
  ];

  // Prazos Notariais SLA
  const deadlineItems = [
    {
      id: "dl-1",
      protocol: "#CRT-9120",
      certificate: "Matrícula Atualizada com Ônus",
      cartorio: "9º RGI da Capital (Rio de Janeiro/RJ)",
      expectedDate: "Hoje, 17:00",
      daysRemaining: 0,
      slaStatus: "warning" as const,
    },
    {
      id: "dl-2",
      protocol: "#CRT-9118",
      certificate: "Certidão de Nascimento Inteiro Teor",
      cartorio: "1º Subdistrito - Sé (São Paulo/SP)",
      expectedDate: "Amanhã, 12:00",
      daysRemaining: 1,
      slaStatus: "on_time" as const,
    },
    {
      id: "dl-3",
      protocol: "#CRT-9095",
      certificate: "Negativa de Testamento (CENSEC)",
      cartorio: "CENSEC Nacional (Colégio Notarial)",
      expectedDate: "29/08/2026",
      daysRemaining: 2,
      slaStatus: "on_time" as const,
    },
  ];

  // Tabela Operacional de Pedidos
  const ordersList = [
    {
      id: "req-1",
      protocol: "#CRT-9120",
      certificate: "Matrícula de Imóvel Atualizada",
      type: "Registro de Imóveis (RGI)",
      client: "Dr. Marcelo Fagundes (Proc. 1024-2026)",
      cartorio: "9º Registro de Imóveis da Capital - Rio de Janeiro (RJ)",
      cns: "088096",
      official: "Bel. Carlos Eduardo de Souza",
      phone: "(21) 2240-8899",
      address: "Av. Rio Branco, 156, Centro, Rio de Janeiro - RJ",
      status: "EM_PROCESSAMENTO",
      deadline: "Hoje, 17h",
      price: "R$ 194,50",
      category: "processing",
      events: [
        {
          id: "ev-1",
          title: "Busca na Base Digital do RGI Concluída",
          description: "Matrícula nº 48.912 localizada nos índices digitais do 9º RGI.",
          timestamp: "Hoje, 14:10",
          status: "completed" as const,
          actor: "Escrevente Autorizado",
        },
        {
          id: "ev-2",
          title: "Exame de Gravames & Qualificação Registral",
          description: "Verificação de penhoras, hipotecas e ações reipersecutórias em andamento.",
          timestamp: "Hoje, 11:30",
          status: "current" as const,
          actor: "Oficial Registrador",
          legalNote: "Conforme Provimento CNJ nº 149/2023.",
        },
        {
          id: "ev-3",
          title: "Prenotação no Protocolo Geral",
          description: "Entrada registrada no Livro 1 com garantia de prioridade legal.",
          timestamp: "Hoje, 09:15",
          status: "completed" as const,
          actor: "Protocolo Eletrônico",
        },
      ],
    },
    {
      id: "req-2",
      protocol: "#CRT-9118",
      certificate: "Certidão de Nascimento (Inteiro Teor)",
      type: "Registro Civil das Pessoas Naturais",
      client: "Inventário Família Prado",
      cartorio: "1º Subdistrito - Sé - São Paulo (SP)",
      cns: "111328",
      official: "Dra. Maria Helena Barbosa",
      phone: "(11) 3105-4422",
      address: "Pça. da Sé, 385, Centro, São Paulo - SP",
      status: "EM_ANALISE",
      deadline: "Amanhã",
      price: "R$ 148,90",
      category: "processing",
      events: [
        {
          id: "ev-1",
          title: "Conferência de Assento no Livro A-124",
          description: "Localização física do termo de nascimento de 1974 para digitalização integral.",
          timestamp: "Ontem, 16:45",
          status: "current" as const,
          actor: "Seção de Arquivo Notarial",
        },
        {
          id: "ev-2",
          title: "Taxas e Emolumentos Validados",
          description: "Guia de custas do TJSP conferida sem pendências.",
          timestamp: "Ontem, 14:00",
          status: "completed" as const,
          actor: "Sistema Integrado TJSP",
        },
      ],
    },
    {
      id: "req-3",
      protocol: "#CRT-9102",
      certificate: "Escritura Pública de Compra e Venda",
      type: "Tabelionato de Notas",
      client: "Auditoria Imobiliária Jardim Europa",
      cartorio: "14º Tabelião de Notas da Capital - São Paulo (SP)",
      cns: "110635",
      official: "Tabelião Paulo Roberto Ferreira",
      phone: "(11) 3887-1200",
      address: "Al. Santos, 1800, Cerqueira César, São Paulo - SP",
      status: "COM_PENDENCIA",
      deadline: "Exigência",
      price: "R$ 178,00",
      category: "attention",
      events: [
        {
          id: "ev-1",
          title: "Exigência Emitida pelo Escrevente",
          description: "Solicitada certidão de casamento atualizada do vendedor.",
          timestamp: "Há 2 horas",
          status: "error" as const,
          actor: "Escrevente Substituto",
          legalNote: "Necessário para cumprir o Art. 221 da Lei dos Registros Públicos.",
        },
        {
          id: "ev-2",
          title: "Prenotação Efetuada",
          description: "Protocolo 491.220 gerado no sistema notarial.",
          timestamp: "27/08/2026",
          status: "completed" as const,
          actor: "Recepção de Títulos",
        },
      ],
    },
    {
      id: "req-4",
      protocol: "#CRT-9080",
      certificate: "Certidão Negativa de Testamento",
      type: "Notas (CENSEC Nacional)",
      client: "Dra. Beatriz Vasconcelos",
      cartorio: "Colégio Notarial do Brasil - Seção SP (CENSEC)",
      cns: "000001",
      official: "Administração Central CENSEC",
      phone: "(11) 3122-6277",
      address: "Rua Bela Cintra, 746, Consolação, São Paulo - SP",
      status: "CONCLUIDA",
      deadline: "Emitida",
      price: "R$ 115,00",
      category: "completed",
      hashIcp: "a7f9c2e0b4d183f98274a56b2c918f4a13d7890e2b4f5a6c7d8e9f0a1b2c3d4e",
      signedAt: "26/08/2026 às 15:40:12 BRT",
      events: [
        {
          id: "ev-1",
          title: "Certidão Lavrada e Assinada Digitalmente",
          description: "Assinatura digital ICP-Brasil com carimbo do tempo oficial.",
          timestamp: "26/08/2026 às 15:40",
          status: "completed" as const,
          actor: "Oficial CENSEC Brasil",
          legalNote: "Válida em todo o Brasil (Padrão PAdES ICP-Brasil).",
        },
        {
          id: "ev-2",
          title: "Varredura Nacional de Testamentos",
          description: "Nenhum testamento registrado em nome do falecido em nenhum estado.",
          timestamp: "26/08/2026 às 11:20",
          status: "completed" as const,
          actor: "Sistema CENSEC/CNB",
        },
      ],
    },
    {
      id: "req-5",
      protocol: "#CRT-9072",
      certificate: "Certidão de Casamento com Averbação",
      type: "Registro Civil das Pessoas Naturais",
      client: "Ação de Divórcio Consensual",
      cartorio: "2º Subdistrito - Liberdade - São Paulo (SP)",
      cns: "111336",
      official: "Bel. Antônio Marcos Silveira",
      phone: "(11) 3208-9900",
      address: "Rua Galvão Bueno, 212, Liberdade, São Paulo - SP",
      status: "CONCLUIDA",
      deadline: "Emitida",
      price: "R$ 152,00",
      category: "completed",
      hashIcp: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      signedAt: "25/08/2026 às 17:12:05 BRT",
      events: [
        {
          id: "ev-1",
          title: "Certidão Digital Emitida e Disponibilizada",
          description: "Documento assinado com certificado ICP-Brasil pelo Oficial Registrador.",
          timestamp: "25/08/2026 às 17:12",
          status: "completed" as const,
          actor: "Oficial do Registro Civil",
        },
      ],
    },
  ];

  // Filter orders by tab and search query
  const filteredOrders = ordersList.filter((order) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "attention" && order.category === "attention") ||
      (activeTab === "processing" && order.category === "processing") ||
      (activeTab === "completed" && order.category === "completed");

    const matchesSearch =
      order.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.certificate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cartorio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cns.includes(searchTerm);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* 1. Page Header with Contextual Toolbar */}
      <PageHeader
        title="Painel Operacional Notarial"
        description="Acompanhe o ciclo de vida das certidões, prazos de expedição e exigências pendentes nos cartórios do Brasil."
        badge={
          <Badge variant="brand" size="sm">
            Silveira & Associados • B2B
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<BookOpen className="w-4 h-4 text-amber-500" />}
              onClick={() => setIsGlossaryOpen(true)}
            >
              Glossário Notarial
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewRequestOpen(true)}
            >
              Nova Solicitação
            </Button>
          </div>
        }
      />

      {/* 2. Interactive Didactic Pipeline Banner */}
      <CartorialLifecycle onOpenGlossary={() => setIsGlossaryOpen(true)} />

      {/* 3. Operational Numbers Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Solicitações Ativas"
          value="28"
          subtitle="Em tramitação nos cartórios"
          trend={{ value: "+4 hoje", isPositive: true }}
          icon={<FileText className="w-4 h-4" />}
          variant="default"
        />
        <MetricCard
          title="Em Processamento"
          value="19"
          subtitle="Aguardando emissão notarial"
          icon={<Clock className="w-4 h-4" />}
          variant="info"
        />
        <MetricCard
          title="Exigem Atenção"
          value="2"
          subtitle="Pendências ou exigências"
          icon={<AlertTriangle className="w-4 h-4" />}
          variant="warning"
        />
        <MetricCard
          title="Concluídas no Mês"
          value="142"
          subtitle="PDFs com assinatura ICP-Brasil"
          trend={{ value: "+18% vs mês ant.", isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="success"
        />
      </div>

      {/* 4. Quick Start Categories Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Solicitações Rápidas por Especialidade Notarial
            </h3>
            <p className="text-[11px] text-neutral-500">
              Selecione o tipo de certidão para emissão imediata com roteamento inteligente
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsGlossaryOpen(true)}
            className="text-xs text-brand-950 dark:text-brand-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Qual certidão escolher?</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: RGI */}
          <div
            onClick={() => setIsNewRequestOpen(true)}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-200 bg-neutral-0 hover:border-brand-500 dark:hover:border-brand-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-950 dark:text-brand-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                Média: 2 a 4h
              </span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-brand-950 dark:group-hover:text-brand-300">
              Registro de Imóveis (RGI)
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Matrícula Atualizada, Ônus Reais e Vintenária para due diligence imobiliária.
            </p>
          </div>

          {/* Card 2: Civil */}
          <div
            onClick={() => setIsNewRequestOpen(true)}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-200 bg-neutral-0 hover:border-brand-500 dark:hover:border-brand-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-950 dark:text-brand-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                Média: 24 a 48h
              </span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-brand-950 dark:group-hover:text-brand-300">
              Registro Civil
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Nascimento, Casamento e Óbito (Breve Relato ou Inteiro Teor para inventários).
            </p>
          </div>

          {/* Card 3: CENSEC */}
          <div
            onClick={() => setIsNewRequestOpen(true)}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-200 bg-neutral-0 hover:border-brand-500 dark:hover:border-brand-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-950 dark:text-brand-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded">
                Nacional: 24h
              </span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-brand-950 dark:group-hover:text-brand-300">
              Notas & CENSEC
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Negativa de Testamento, Procurações Públicas e Escrituras Declaratórias.
            </p>
          </div>

          {/* Card 4: Protesto */}
          <div
            onClick={() => setIsNewRequestOpen(true)}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-200 bg-neutral-0 hover:border-brand-500 dark:hover:border-brand-400 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-950 dark:text-brand-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                Média: 24h
              </span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900 group-hover:text-brand-950 dark:group-hover:text-brand-300">
              Protesto & Distribuidores
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Pesquisa de títulos protestados de 5 e 10 anos e certidões cíveis/criminais.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Split Section: AttentionPanel (Left) + DeadlineList (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttentionPanel
            items={attentionItems}
            onResolve={(item) => setResolvingItem(item)}
            onViewAll={() => setActiveTab("attention")}
          />
        </div>
        <div className="lg:col-span-1">
          <DeadlineList items={deadlineItems} />
        </div>
      </div>

      {/* 6. Main Operational Data Table with Smart Filter Tabs */}
      <Card padding="none" className="overflow-hidden shadow-xs">
        {/* Table Top Header with Tabs */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-50/10">
          {/* Smart Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-brand-950 text-neutral-0 dark:bg-brand-50 dark:text-brand-950 shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60"
              }`}
            >
              <span>Todas as Solicitações</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-inherit">
                {ordersList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attention")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "attention"
                  ? "bg-semantic-warning text-neutral-0 shadow-2xs"
                  : "text-semantic-warning hover:bg-semantic-warning-bg/60"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Exigem Atenção</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-semantic-warning-bg text-semantic-warning font-bold">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("processing")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "processing"
                  ? "bg-semantic-info text-neutral-0 shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Em Tramitação</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-inherit">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "completed"
                  ? "bg-semantic-success text-neutral-0 shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluídas (PDF)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-inherit">
                2
              </span>
            </button>
          </div>

          {/* Quick Search Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full md:w-60">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por protocolo, cartório, CNS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs bg-neutral-0 border border-neutral-300 dark:border-neutral-200 rounded-md focus:outline-none focus:border-brand-500 w-full"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Certidão & Categoria</TableHead>
              <TableHead>Cliente / Referência</TableHead>
              <TableHead>Cartório / Serventia</TableHead>
              <TableHead>Status Notarial</TableHead>
              <TableHead>Previsão SLA</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-bold text-neutral-900">
                  {order.protocol}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-neutral-900 leading-tight">
                    {order.certificate}
                  </div>
                  <span className="text-[11px] text-neutral-500">{order.type}</span>
                </TableCell>
                <TableCell className="font-medium text-neutral-800">
                  {order.client}
                </TableCell>
                <TableCell>
                  <div className="text-neutral-700 text-xs truncate max-w-[220px]">
                    {order.cartorio}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    CNS: {order.cns}
                  </span>
                </TableCell>
                <TableCell>
                  <RequestStatus status={order.status} size="sm" />
                </TableCell>
                <TableCell className="font-medium text-xs text-neutral-700">
                  {order.deadline}
                </TableCell>
                <TableCell className="font-semibold text-neutral-900">
                  {order.price}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        aria-label="Opções da solicitação"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      {
                        id: "details",
                        label: "Ver Dossiê Completo",
                        icon: <Eye className="w-3.5 h-3.5" />,
                        onClick: () => setSelectedRequestDetails(order),
                      },
                      {
                        id: "download",
                        label: "Baixar PDF ICP-Brasil",
                        icon: <Download className="w-3.5 h-3.5" />,
                        disabled: order.status !== "CONCLUIDA",
                        onClick: () => alert(`Baixando certidão digital ${order.protocol} com assinatura ICP-Brasil...`),
                      },
                      "separator",
                      {
                        id: "cartorio-info",
                        label: "Ficha da Serventia CNJ",
                        icon: <Landmark className="w-3.5 h-3.5" />,
                        onClick: () => setSelectedRequestDetails(order),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-neutral-500">
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-neutral-400" />
                    <p className="font-medium text-xs">
                      Nenhuma solicitação encontrada para o filtro selecionado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("all");
                        setSearchTerm("");
                      }}
                      className="text-xs text-brand-950 font-bold hover:underline"
                    >
                      Exibir todas as solicitações
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredOrders.length / 5) || 1}
          totalItems={filteredOrders.length}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* 7. New Request Guided Modal */}
      <Dialog isOpen={isNewRequestOpen} onClose={() => setIsNewRequestOpen(false)} size="lg">
        <DialogHeader onClose={() => setIsNewRequestOpen(false)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-950 text-neutral-0 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Nova Emissão Notarial & Registral B2B</DialogTitle>
              <DialogDescription>
                Inicie um novo pedido consolidado de certidões com roteamento para cartórios de qualquer estado.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-900 block">
              1. Referência do Processo / Caso / Imóvel
            </label>
            <Input
              placeholder="Ex: Inventário Prado / Ação 00142-2026 / Edifício Horizon"
              helperText="Código interno para agrupar faturamento e relatórios"
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-neutral-900 block">
              2. Selecione a Especialidade Notarial Principal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 space-y-1 cursor-pointer">
                <div className="flex items-center justify-between font-bold text-brand-950 dark:text-brand-300">
                  <span>🏢 Registro de Imóveis (RGI)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">2 a 4h</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Matrícula, Ônus Reais, Ações Reipersecutórias e Vintenária.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-200 hover:border-brand-400 space-y-1 cursor-pointer">
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>📜 Registro Civil (RCPN)</span>
                  <span className="text-[10px] text-blue-600 font-semibold">24 a 48h</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Nascimento, Casamento e Óbito (Breve Relato ou Inteiro Teor).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-200 hover:border-brand-400 space-y-1 cursor-pointer">
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>🏛️ Notas & CENSEC</span>
                  <span className="text-[10px] text-purple-600 font-semibold">24h</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Negativa de Testamento, Procurações e Escrituras Públicas.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-200 hover:border-brand-400 space-y-1 cursor-pointer">
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span>⚖️ Protesto & Distribuidores</span>
                  <span className="text-[10px] text-amber-600 font-semibold">24h</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Certidões de Protesto 5/10 anos e Distribuidores Cíveis.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 rounded-lg text-xs text-brand-950 dark:text-brand-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Emissão Multi-Cartórios Centralizada</span>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Você pode solicitar múltiplas certidões de cidades e estados diferentes em uma única fatura com acompanhamento unificado.
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setIsNewRequestOpen(false)}>
            Avançar para Dados do Cartório
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 8. Resolve Requirement Modal */}
      {resolvingItem && (
        <Dialog isOpen={Boolean(resolvingItem)} onClose={() => { setResolvingItem(null); setUploadSuccess(false); }} size="md">
          <DialogHeader onClose={() => { setResolvingItem(null); setUploadSuccess(false); }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-semantic-warning text-neutral-0 flex items-center justify-center">
                <FileUp className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle>Cumprimento de Exigência Cartorial</DialogTitle>
                <DialogDescription>
                  Protocolo {resolvingItem.protocol} • {resolvingItem.cartorio}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogContent className="space-y-4 text-xs">
            <div className="p-3 bg-semantic-warning-bg/60 border border-semantic-warning-border rounded-lg space-y-1">
              <span className="font-bold text-neutral-900 block">{resolvingItem.title}</span>
              <p className="text-neutral-700 leading-relaxed">{resolvingItem.description}</p>
              {resolvingItem.deadlineDate && (
                <span className="text-[11px] font-bold text-semantic-error block pt-1">
                  Prazo de resposta: {resolvingItem.deadlineDate}
                </span>
              )}
            </div>

            {uploadSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-xs">Documento Enviado com Sucesso!</h4>
                <p className="text-[11px] text-emerald-700">
                  O despacho foi encaminhado diretamente ao escrevente do cartório. O status será atualizado em até 2 horas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-200 rounded-lg p-6 text-center space-y-2 hover:border-brand-500 transition-colors cursor-pointer">
                  <FileUp className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Clique para selecionar o PDF</span>
                    <span className="text-[11px] text-neutral-500">
                      Certidão em PDF legível ou documento complementar (Máx 25MB)
                    </span>
                  </div>
                </div>

                <Input
                  label="Mensagem de Esclarecimento para o Escrevente (Opcional)"
                  placeholder="Ex: Segue em anexo a certidão de casamento atualizada conforme solicitado no item 2 da nota devolutiva."
                />
              </div>
            )}
          </DialogContent>

          <DialogFooter>
            {uploadSuccess ? (
              <Button variant="primary" onClick={() => { setResolvingItem(null); setUploadSuccess(false); }}>
                Concluir
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setResolvingItem(null)}>
                  Fechar
                </Button>
                <Button variant="primary" onClick={() => setUploadSuccess(true)}>
                  Enviar Resposta ao Cartório
                </Button>
              </>
            )}
          </DialogFooter>
        </Dialog>
      )}

      {/* 9. Rich Notary Dossier Sheet */}
      {selectedRequestDetails && (
        <Sheet
          isOpen={Boolean(selectedRequestDetails)}
          onClose={() => setSelectedRequestDetails(null)}
          size="lg"
        >
          <SheetHeader onClose={() => setSelectedRequestDetails(null)}>
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                {selectedRequestDetails.protocol}
              </Badge>
              <RequestStatus status={selectedRequestDetails.status} size="sm" />
            </div>
            <SheetTitle>{selectedRequestDetails.certificate}</SheetTitle>
            <SheetDescription>{selectedRequestDetails.type}</SheetDescription>
          </SheetHeader>

          <SheetContent className="space-y-6 text-xs overflow-y-auto pr-1">
            {/* Action Bar inside Sheet */}
            {selectedRequestDetails.status === "CONCLUIDA" && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-xs">
                      Certidão Digital ICP-Brasil Pronta
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Assinada em {selectedRequestDetails.signedAt || "26/08/2026"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => alert(`Baixando ${selectedRequestDetails.protocol}...`)}
                >
                  Baixar PDF
                </Button>
              </div>
            )}

            {/* Cartorio Technical Card (CNJ) */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-50/20 rounded-xl border border-neutral-200 dark:border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Ficha da Serventia (CNJ)
                </span>
                <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-200 px-1.5 py-0.5 rounded font-bold">
                  CNS: {selectedRequestDetails.cns}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Landmark className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block">{selectedRequestDetails.cartorio}</strong>
                    {selectedRequestDetails.official && (
                      <span className="text-[11px] text-neutral-500">
                        Titular: {selectedRequestDetails.official}
                      </span>
                    )}
                  </div>
                </div>

                {selectedRequestDetails.address && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{selectedRequestDetails.address}</span>
                  </div>
                )}

                {selectedRequestDetails.phone && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{selectedRequestDetails.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900 text-xs">
                  Histórico Notarial Completo
                </h4>
                <span className="text-[10px] text-neutral-400">Rastreabilidade em tempo real</span>
              </div>

              <RequestTimeline
                events={
                  selectedRequestDetails.events || [
                    {
                      id: "ev-1",
                      title: "Pedido Recebido na Central Cartori",
                      description: "Validação automática dos parâmetros de emissão.",
                      timestamp: "Hoje, 10:00",
                      status: "completed",
                    },
                  ]
                }
              />
            </div>

            {/* ICP-Brasil Hash Details */}
            {selectedRequestDetails.hashIcp && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-100/40 rounded-lg space-y-1 text-[11px] font-mono border border-neutral-200">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Hash SHA-256 de Conformidade:
                </span>
                <span className="text-neutral-500 break-all text-[10px]">
                  {selectedRequestDetails.hashIcp}
                </span>
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}

      {/* 10. Didactic Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
}
