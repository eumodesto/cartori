"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Stepper } from "@/components/ui/stepper";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
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
  SheetFooter,
} from "@/components/ui/sheet";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/tooltip";
import { IconBar } from "@/components/ui/icon-bar";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/layout/card";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  FileText,
  Search,
  Plus,
  ArrowRight,
  Download,
  Trash2,
  MoreVertical,
  Layers,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Send,
  Eye,
  SlidersHorizontal,
  Home,
  Check,
} from "lucide-react";

export default function DesignSystemShowcasePage() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = React.useState("actions");
  const [activePillTab, setActivePillTab] = React.useState("b2b");

  // Form states
  const [inputValue, setInputValue] = React.useState("Certidão de Nascimento em Breve Relato");
  const [selectValue, setSelectValue] = React.useState("sp");
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);
  const [radioValue, setRadioValue] = React.useState("digital");
  const [switchChecked, setSwitchChecked] = React.useState(true);

  // Overlay demo states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Stepper state
  const [activeStep, setActiveStep] = React.useState<string | number>("1");

  // Table selection state
  const [selectedRows, setSelectedRows] = React.useState<string[]>(["req-1"]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-surface-page text-neutral-900 flex flex-col font-sans">
      {/* Top Banner Bar */}
      <header className="h-14 bg-brand-950 text-neutral-0 px-6 flex items-center justify-between border-b border-brand-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center font-bold text-xs text-neutral-0">
            C
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">CARTORI</span>
            <span className="text-[11px] text-brand-300 ml-2 font-mono">Design System v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Theme Toggle Button */}
          <ThemeToggle variant="outline" size="sm" showLabel />

          <Link
            href="/"
            className="text-neutral-300 hover:text-neutral-0 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Voltar ao B2C</span>
          </Link>
          <span className="text-neutral-600">|</span>
          <Link
            href="/dashboard"
            className="text-brand-300 hover:text-neutral-0 transition-colors font-medium"
          >
            Ir ao Dashboard
          </Link>
          <span className="text-neutral-600">|</span>
          <span className="bg-brand-900 text-brand-200 px-2 py-0.5 rounded font-mono text-[10px]">
            Ambiente Interno
          </span>
        </div>
      </header>

      <PageContainer maxWidth="xl">
        <PageHeader
          title="Design System V1 — Fundação Visual"
          description="Biblioteca oficial de tokens e componentes de alta densidade desenvolvida para LegalTech, FinTech e operações documentais B2B."
          breadcrumbs={
            <Breadcrumb
              items={[
                { label: "Cartori Core", href: "/" },
                { label: "Engenharia & Design", href: "#" },
                { label: "Design System Showcase", isCurrent: true },
              ]}
            />
          }
          badge={<Badge variant="brand">SaaS B2B & Backoffice Ready</Badge>}
          actions={
            <IconBar
              items={[
                {
                  id: "new-req",
                  label: "Nova Solicitação",
                  icon: <Plus className="w-4 h-4" />,
                  variant: "primary",
                  onClick: () => setIsDialogOpen(true),
                },
                {
                  id: "filter",
                  label: "Filtrar Painel",
                  icon: <SlidersHorizontal className="w-4 h-4" />,
                  onClick: () => setIsSheetOpen(true),
                },
              ]}
            />
          }
        />

        {/* =========================================================================
            SECTION 1: FOUNDATIONS
           ========================================================================= */}
        <Section
          title="1. Foundations & Tokens"
          description="Escalas primitivas, neutros de alta escaneabilidade e semântica operacional."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand Colors */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle className="text-xs">Cartori Navy (Brand Scale)</CardTitle>
                <CardDescription>Base Primária: #011E37</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                <div className="flex items-center justify-between p-1.5 rounded bg-brand-950 text-neutral-0 text-[10px] font-mono">
                  <span>brand-950</span>
                  <span>#011E37</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-brand-900 text-neutral-0 text-[10px] font-mono">
                  <span>brand-900</span>
                  <span>#062943</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-brand-700 text-neutral-0 text-[10px] font-mono">
                  <span>brand-700</span>
                  <span>#0B496C</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-brand-500 text-neutral-0 text-[10px] font-mono">
                  <span>brand-500</span>
                  <span>#0876A5</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-brand-50 text-brand-950 border border-brand-200 text-[10px] font-mono">
                  <span>brand-50</span>
                  <span>#F0F8FB</span>
                </div>
              </CardContent>
            </Card>

            {/* Neutral Scale */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle className="text-xs">Neutral Scale (Operacional)</CardTitle>
                <CardDescription>90% da interface do SaaS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-900 text-neutral-0 text-[10px] font-mono">
                  <span>neutral-900</span>
                  <span>#142A38</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-700 text-neutral-0 text-[10px] font-mono">
                  <span>neutral-700</span>
                  <span>#3D4E5A</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-300 text-neutral-900 text-[10px] font-mono">
                  <span>neutral-300</span>
                  <span>#D2DADF</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-100 text-neutral-900 text-[10px] font-mono border border-neutral-200">
                  <span>neutral-100</span>
                  <span>#F2F5F7</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-0 text-neutral-900 text-[10px] font-mono border border-neutral-200">
                  <span>neutral-0</span>
                  <span>#FFFFFF</span>
                </div>
              </CardContent>
            </Card>

            {/* Semantic Status */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle className="text-xs">Semantic Status Colors</CardTitle>
                <CardDescription>Semântica operacional com texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex items-center justify-between p-1.5 rounded bg-semantic-success-bg border border-semantic-success-border text-semantic-success text-[11px] font-medium">
                  <span>Success (#16835A)</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning text-[11px] font-medium">
                  <span>Warning (#B7791F)</span>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-semantic-error-bg border border-semantic-error-border text-semantic-error text-[11px] font-medium">
                  <span>Error (#C93C37)</span>
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-semantic-info-bg border border-semantic-info-border text-semantic-info text-[11px] font-medium">
                  <span>Info (#2878B5)</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>

            {/* Spacing & Radius */}
            <Card padding="sm">
              <CardHeader>
                <CardTitle className="text-xs">Radius & Elevation (Shadows)</CardTitle>
                <CardDescription>Sem glassmorphism ou sombras pesadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs">
                <div className="p-2 rounded-sm border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <span>sm (4px)</span>
                  <span className="text-[10px] text-neutral-500">Controles & Badges</span>
                </div>
                <div className="p-2 rounded-md border border-neutral-200 bg-neutral-0 shadow-xs flex items-center justify-between">
                  <span>md (8px)</span>
                  <span className="text-[10px] text-neutral-500">Inputs & Botões</span>
                </div>
                <div className="p-2 rounded-lg border border-neutral-200 bg-neutral-0 shadow-sm flex items-center justify-between">
                  <span>lg (12px)</span>
                  <span className="text-[10px] text-neutral-500">Cards & Modais</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* =========================================================================
            SECTION 2: ACTIONS & BUTTONS
           ========================================================================= */}
        <Section
          title="2. Actions (Buttons & IconButtons)"
          description="Botões funcionais, consistentes em altura (40px default) e sem formatos pill arbitrários."
        >
          <Card>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Variantes Principais
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary (Brand Navy)</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Tamanhos Padronizados
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary">Small (32px)</Button>
                  <Button size="md" variant="primary">Medium Default (40px)</Button>
                  <Button size="lg" variant="primary">Large (48px)</Button>
                </div>
              </div>

              {/* States Side-by-Side */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Estados Operacionais (Default, Loading, Disabled, Icons)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button leftIcon={<Plus className="w-4 h-4" />}>Com Ícone Esquerdo</Button>
                  <Button rightIcon={<ArrowRight className="w-4 h-4" />} variant="outline">
                    Avançar Etapa
                  </Button>
                  <Button isLoading variant="primary">Processando</Button>
                  <Button disabled variant="primary">Desabilitado</Button>
                  <Button disabled variant="outline">Desabilitado Outline</Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Icon Buttons
                </h4>
                <div className="flex items-center gap-3">
                  <IconButton icon={<Search className="w-4 h-4" />} aria-label="Pesquisar" size="sm" />
                  <IconButton icon={<Download className="w-4 h-4" />} aria-label="Baixar Documento" size="md" />
                  <IconButton icon={<SlidersHorizontal className="w-4 h-4" />} aria-label="Filtros" size="lg" />
                  <IconButton icon={<Trash2 className="w-4 h-4" />} aria-label="Excluir" variant="destructive" size="md" />
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* =========================================================================
            SECTION 3: FORMS
           ========================================================================= */}
        <Section
          title="3. Formulários & Entradas de Dados"
          description="Inputs, Selects, Checkboxes, Radios e Switches com 40px de altura e validação visual de erros."
        >
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Input Default */}
              <Input
                label="Nome do Requerente / Titular"
                placeholder="Ex: João da Silva Santos"
                helperText="Informe o nome completo conforme certidão"
                required
              />

              {/* Input Filled with Left Icon */}
              <Input
                label="Protocolo de Busca Notarial"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                helperText="Busca automática no índice do CNS"
              />

              {/* Input with Error State */}
              <Input
                label="CPF do Solicitante"
                value="123.456.789-XX"
                error="CPF inválido ou não registrado na Receita Federal"
                required
              />

              {/* Input Disabled */}
              <Input
                label="Código CNS do Cartório"
                value="111328 (1º Subdistrito - Sé)"
                disabled
                helperText="Identificador gerado pelo CNJ"
              />

              {/* Select */}
              <Select
                label="Estado de Origem do Documento"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: "sp", label: "São Paulo (SP)" },
                  { value: "rj", label: "Rio de Janeiro (RJ)" },
                  { value: "mg", label: "Minas Gerais (MG)" },
                  { value: "pr", label: "Paraná (PR)" },
                ]}
                required
              />

              {/* Textarea */}
              <div className="lg:col-span-1">
                <Textarea
                  label="Observações para o Cartório"
                  placeholder="Informações complementares para localização do assento..."
                  helperText="Máximo de 500 caracteres"
                />
              </div>
            </div>

            {/* Checkbox, Radio, Switch */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 mt-6">
              <div>
                <h4 className="text-xs font-semibold text-neutral-700 mb-3">Checkboxes</h4>
                <div className="space-y-3">
                  <Checkbox
                    label="Assinatura Digital ICP-Brasil"
                    description="Emitir com validade jurídica nacional"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                  />
                  <Checkbox
                    label="Opção Desabilitada"
                    disabled
                    description="Indisponível para esta serventia"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-700 mb-3">Radio Group</h4>
                <RadioGroup
                  name="format-options"
                  value={radioValue}
                  onChange={setRadioValue}
                  options={[
                    { value: "digital", label: "Certidão Digital (PDF Seguro)", description: "Envio instantâneo por e-mail" },
                    { value: "fisica", label: "Certidão em Papel Moeda", description: "Envio via Correios Sedex" },
                  ]}
                />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-700 mb-3">Toggle Switches</h4>
                <div className="space-y-4">
                  <Switch
                    label="Notificações via WhatsApp"
                    description="Receber status em tempo real a cada andamento"
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                  />
                  <Switch
                    label="Integração Automática API"
                    description="Recurso desabilitado no plano atual"
                    checked={false}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* =========================================================================
            SECTION 4: FEEDBACK & STATUS (Badge vs StatusBadge)
           ========================================================================= */}
        <Section
          title="4. Feedback & Badges (Categórico vs Operacional)"
          description="Distinção rigorosa entre Badges de classificação e StatusBadges de estado operacional."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorical Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Badges Categóricos</CardTitle>
                <CardDescription>Uso para classificação de tipo, grupo ou tag documental</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Badge variant="brand">Registro Civil</Badge>
                <Badge variant="default">Imóveis (RGI)</Badge>
                <Badge variant="secondary">Tabelionato de Notas</Badge>
                <Badge variant="outline">Protesto</Badge>
                <Badge variant="neutral">B2B Empresas</Badge>
              </CardContent>
            </Card>

            {/* Operational StatusBadges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">StatusBadges Operacionais</CardTitle>
                <CardDescription>Uso estrito de ciclo de vida operacional (sempre com texto)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <StatusBadge status="neutral" label="Solicitada" />
                <StatusBadge status="info" label="Em Análise no Cartório" />
                <StatusBadge status="warning" label="Aguardando Documento" />
                <StatusBadge status="success" label="Certidão Concluída" />
                <StatusBadge status="error" label="Erro / Rejeitada" />
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div className="space-y-3 mt-4">
            <Alert variant="info" title="Serventia Integrada ao Barramento Nacional">
              Este cartório possui suporte à emissão expressa com entrega do arquivo digital em até 4 horas úteis.
            </Alert>
            <Alert variant="success" title="Certidão Emitida com Assinatura ICP-Brasil">
              O arquivo PDF validado e com chave de autenticidade foi gerado com sucesso.
            </Alert>
            <Alert variant="warning" title="Atenção à Comarca Selecionada">
              O município informado possui mais de uma circunscrição imobiliária. Certifique-se do número do RGI.
            </Alert>
            <Alert variant="error" title="Falha de Comunicação com a Serventia" onClose={() => {}}>
              O servidor do tribunal retornou indisponibilidade temporária. Nossa equipe efetuará reenvio assistido.
            </Alert>
          </div>
        </Section>

        {/* =========================================================================
            SECTION 5: DATA TABLE (B2B Operational Table)
           ========================================================================= */}
        <Section
          title="5. Data Table (Tabela Operacional B2B)"
          description="Tabela densa, clara, de alta escaneabilidade com seleção de linhas, status operacional e paginação."
        >
          <Card padding="none">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-800">
                  Solicitações Recentes
                </span>
                <Badge variant="brand" size="sm">1.240 Ativas</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar por protocolo, cliente ou cartório..."
                  className="h-8 text-xs w-64"
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                />
                <Button size="sm" variant="outline">
                  Exportar CSV
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input type="checkbox" className="rounded border-neutral-300" aria-label="Selecionar todas as linhas" />
                  </TableHead>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Certidão / Tipo</TableHead>
                  <TableHead>Cliente / Organização</TableHead>
                  <TableHead>Cartório / Comarca</TableHead>
                  <TableHead>Status Operacional</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    id: "req-1",
                    protocol: "#CRT-8921",
                    cert: "Certidão de Nascimento",
                    type: "Registro Civil",
                    client: "Advocacia Silveira & Associados",
                    cartorio: "1º Subdistrito - Sé (São Paulo/SP)",
                    status: "success" as const,
                    statusText: "Concluída",
                    price: "R$ 148,90",
                  },
                  {
                    id: "req-2",
                    protocol: "#CRT-8922",
                    cert: "Matrícula de Imóvel Atualizada",
                    type: "Registro de Imóveis",
                    client: "Imobiliária Prime Rio",
                    cartorio: "9º RGI da Capital (Rio de Janeiro/RJ)",
                    status: "info" as const,
                    statusText: "Em Processamento",
                    price: "R$ 194,50",
                  },
                  {
                    id: "req-3",
                    protocol: "#CRT-8923",
                    cert: "Escritura Pública Declaratória",
                    type: "Notas",
                    client: "Barros & Fonseca Contabilidade",
                    cartorio: "14º Tabelionato de Notas (São Paulo/SP)",
                    status: "warning" as const,
                    statusText: "Com Pendência",
                    price: "R$ 178,00",
                  },
                  {
                    id: "req-4",
                    protocol: "#CRT-8924",
                    cert: "Certidão Negativa de Testamento (CENSEC)",
                    type: "Notas",
                    client: "Dra. Mariana Rezende",
                    cartorio: "CENSEC Nacional",
                    status: "neutral" as const,
                    statusText: "Solicitada",
                    price: "R$ 115,00",
                  },
                ].map((row) => {
                  const isSelected = selectedRows.includes(row.id);
                  return (
                    <TableRow key={row.id} isSelected={isSelected}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(row.id)}
                          className="rounded border-neutral-300"
                          aria-label={`Selecionar solicitação ${row.protocol}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-neutral-900">
                        {row.protocol}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-neutral-900">{row.cert}</div>
                        <span className="text-[11px] text-neutral-500">{row.type}</span>
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">
                        {row.client}
                      </TableCell>
                      <TableCell className="text-neutral-600 text-xs truncate max-w-[200px]">
                        {row.cartorio}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} label={row.statusText} size="sm" />
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {row.price}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu
                          trigger={
                            <button
                              type="button"
                              className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                              aria-label="Ações da linha"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                          items={[
                            {
                              id: "view",
                              label: "Visualizar Dossiê",
                              icon: <Eye className="w-3.5 h-3.5" />,
                              onClick: () => setIsSheetOpen(true),
                            },
                            {
                              id: "download",
                              label: "Baixar PDF Seguro",
                              icon: <Download className="w-3.5 h-3.5" />,
                              shortcut: "⌘D",
                            },
                            "separator",
                            {
                              id: "cancel",
                              label: "Cancelar Pedido",
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              destructive: true,
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={124}
              totalItems={1240}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </Card>
        </Section>

        {/* =========================================================================
            SECTION 6: WORKFLOW & NAVIGATION
           ========================================================================= */}
        <Section
          title="6. Workflow & Navegação (Stepper & Tabs)"
          description="Controles estruturados para fluxos de múltiplos passos e alternância de visualizações."
        >
          <div className="space-y-6">
            {/* Horizontal Stepper */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stepper Horizontal</CardTitle>
                <CardDescription>Fluxo de emissão em 4 etapas</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Stepper
                  steps={[
                    { id: "1", title: "Identificação", description: "Cliente e CNPJ", status: "completed" },
                    { id: "2", title: "Certidões", description: "Seleção do serviço", status: "completed" },
                    { id: "3", title: "Dados Notariais", description: "Cartório e livro", status: "current" },
                    { id: "4", title: "Revisão e Pagamento", description: "PIX Mercado Pago", status: "upcoming" },
                  ]}
                  onStepClick={(id) => setActiveStep(id)}
                />
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tabs (Underline Variant)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs
                    variant="underline"
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={[
                      { id: "actions", label: "Solicitações", badge: "24" },
                      { id: "docs", label: "Dossiês" },
                      { id: "audit", label: "Auditoria" },
                    ]}
                  />
                  <div className="py-4 text-xs text-neutral-600">
                    Exibindo conteúdo da aba ativa: <strong className="text-neutral-900">{activeTab}</strong>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tabs (Pill Variant)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs
                    variant="pill"
                    activeTab={activePillTab}
                    onChange={setActivePillTab}
                    tabs={[
                      { id: "b2b", label: "Visão Geral B2B" },
                      { id: "repasses", label: "Extrato Financeiro" },
                      { id: "api", label: "Chaves de API" },
                    ]}
                  />
                  <div className="py-4 text-xs text-neutral-600">
                    Painel selecionado: <strong className="text-neutral-900">{activePillTab}</strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Section>

        {/* =========================================================================
            SECTION 7: OVERLAYS (Dialog, Sheet, Tooltip, Popover)
           ========================================================================= */}
        <Section
          title="7. Overlays (Dialog, Sheet, Dropdown, Tooltip)"
          description="Modais de 12px de raio, gavetas laterais de filtros e popovers informativos."
        >
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => setIsDialogOpen(true)} variant="primary">
                Abrir Dialog / Modal
              </Button>

              <Button onClick={() => setIsSheetOpen(true)} variant="outline">
                Abrir Sheet / Drawer Lateral
              </Button>

              <Tooltip content="Assinatura digital ICP-Brasil padrão A1/A3" side="top">
                <Button variant="secondary" leftIcon={<ShieldCheck className="w-4 h-4 text-semantic-success" />}>
                  Hover para Tooltip
                </Button>
              </Tooltip>

              <Popover
                trigger={
                  <Button variant="outline" leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
                    Abrir Popover
                  </Button>
                }
              >
                <div className="space-y-2 text-xs">
                  <h5 className="font-semibold text-neutral-900">Filtro Rápido Notarial</h5>
                  <p className="text-neutral-500 leading-relaxed">
                    Selecione para exibir apenas serventias com certidão em inteiro teor disponível.
                  </p>
                  <Button size="sm" variant="primary" className="w-full mt-2">
                    Aplicar Filtro
                  </Button>
                </div>
              </Popover>
            </div>
          </Card>
        </Section>

        {/* =========================================================================
            SECTION 8: SIDEBAR FOUNDATION PREVIEW
           ========================================================================= */}
        <Section
          title="8. Sidebar Foundation (AppSidebar Demo)"
          description="Barra lateral estrutural com 256px aberta, 64px recolhida com tooltips e estado ativo suave em brand-50."
        >
          <div className="h-96 rounded-lg border border-neutral-200 overflow-hidden flex bg-surface-subtle">
            <AppSidebar
              currentPath="/solicitacoes"
              groups={[
                {
                  label: "Operações",
                  items: [
                    { id: "dash", label: "Painel Geral", href: "/painel", icon: <Layers className="w-4 h-4" /> },
                    { id: "solic", label: "Solicitações", href: "/solicitacoes", icon: <FileText className="w-4 h-4" />, badge: "12", isActive: true },
                    { id: "dossier", label: "Dossiês Jurídicos", href: "/dossies", icon: <FolderOpen className="w-4 h-4" /> },
                  ],
                },
                {
                  label: "Organização B2B",
                  items: [
                    { id: "org", label: "Empresa & Filiais", href: "/organizacao", icon: <Building2 className="w-4 h-4" /> },
                    { id: "team", label: "Equipe & Advogados", href: "/equipe", icon: <Users className="w-4 h-4" /> },
                  ],
                },
              ]}
            />

            <div className="flex-1 p-6 overflow-y-auto">
              <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                Área de Trabalho Simulada
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Quando a barra lateral é recolhida clicando no botão superior, os rótulos de texto são ocultados e tooltips automáticos são ativados ao passar o mouse sobre cada ícone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card padding="sm" variant="subtle">
                  <span className="text-xs text-neutral-500 block">Total de Pedidos</span>
                  <span className="text-xl font-bold text-neutral-900">1.240</span>
                </Card>
                <Card padding="sm" variant="subtle">
                  <span className="text-xs text-neutral-500 block">Certidões Prontas</span>
                  <span className="text-xl font-bold text-semantic-success">1.182</span>
                </Card>
              </div>
            </div>
          </div>
        </Section>
      </PageContainer>

      {/* =========================================================================
          INTERACTIVE DIALOG DEMO
         ========================================================================= */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} size="md">
        <DialogHeader onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Nova Solicitação de Certidão B2B</DialogTitle>
          <DialogDescription>
            Configure os parâmetros documentais para busca notarial
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <Input
            label="Número de Referência Interna"
            placeholder="Ex: Proc. 002341-2026 / Imóvel Jardim Europa"
            helperText="Identificador exclusivo para conciliação no seu ERP jurídico"
            required
          />
          <Select
            label="Tipo de Certidão Notarial"
            options={[
              { value: "nasc", label: "Certidão de Nascimento (Registro Civil)" },
              { value: "casam", label: "Certidão de Casamento (Registro Civil)" },
              { value: "imovel", label: "Matrícula de Imóvel Atualizada (RGI)" },
              { value: "testamento", label: "Negativa de Testamento (CENSEC)" },
            ]}
          />
          <Checkbox
            label="Notificar departamento financeiro ao emitir"
            checked={true}
            onChange={() => {}}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setIsDialogOpen(false)}>
            Continuar para Cartório
          </Button>
        </DialogFooter>
      </Dialog>

      {/* =========================================================================
          INTERACTIVE SHEET / DRAWER DEMO
         ========================================================================= */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} side="right" size="md">
        <SheetHeader onClose={() => setIsSheetOpen(false)}>
          <SheetTitle>Filtros Avançados de Pesquisa</SheetTitle>
          <SheetDescription>Refine a listagem por comarca, estado ou período</SheetDescription>
        </SheetHeader>
        <SheetContent className="space-y-4">
          <Input label="Protocolo ou Nome" placeholder="Digite para filtrar..." />
          <Select
            label="Filtrar por Status Operacional"
            options={[
              { value: "all", label: "Todos os status" },
              { value: "success", label: "Apenas Concluídas" },
              { value: "info", label: "Apenas Em Processamento" },
              { value: "warning", label: "Apenas Com Pendência" },
            ]}
          />
          <Select
            label="UF do Cartório"
            options={[
              { value: "all", label: "Todos os Estados" },
              { value: "sp", label: "São Paulo (SP)" },
              { value: "rj", label: "Rio de Janeiro (RJ)" },
              { value: "mg", label: "Minas Gerais (MG)" },
            ]}
          />
          <div className="pt-2">
            <Switch
              label="Apenas certidões digitais"
              checked={true}
              onChange={() => {}}
            />
          </div>
        </SheetContent>
        <SheetFooter>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            Limpar Filtros
          </Button>
          <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </Sheet>
    </div>
  );
}
