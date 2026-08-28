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
import { AttentionPanel } from "@/components/cartori/attention-panel";
import { DeadlineList } from "@/components/cartori/deadline-list";
import { RequestStatus } from "@/components/cartori/request-status";
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
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Send,
  Building2,
  HelpCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = React.useState<any | null>(null);

  // Exigências operacionais reais
  const attentionItems = [
    {
      id: "att-1",
      protocol: "#CRT-9102",
      title: "Exigência de Certidão de Casamento com Averbação",
      description: "O 1º Oficial de Registro de Imóveis de SP solicitou certidão de casamento atualizada para prosseguir com o registro da escritura.",
      cartorio: "1º Oficial de Registro de Imóveis da Capital (SP)",
      urgency: "high" as const,
      timeElapsed: "Há 2 horas",
    },
    {
      id: "att-2",
      protocol: "#CRT-9088",
      title: "Diligência de Localização de Assento Antigo",
      description: "O 3º Subdistrito de Registro Civil (Penha) solicitou informar filiação materna para busca nos livros de 1968.",
      cartorio: "3º Subdistrito de Registro Civil - Penha de França (SP)",
      urgency: "medium" as const,
      timeElapsed: "Há 5 horas",
    },
  ];

  // Prazos Notariais SLA
  const deadlineItems = [
    {
      id: "dl-1",
      protocol: "#CRT-9120",
      certificate: "Matrícula Atualizada",
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
      expectedDate: "Amanhã",
      daysRemaining: 1,
      slaStatus: "on_time" as const,
    },
    {
      id: "dl-3",
      protocol: "#CRT-9095",
      certificate: "Negativa de Testamento (CENSEC)",
      cartorio: "CENSEC Nacional",
      expectedDate: "28/08/2026",
      daysRemaining: 2,
      slaStatus: "on_time" as const,
    },
  ];

  // Tabela Operacional de Pedidos
  const recentOrders = [
    {
      id: "req-1",
      protocol: "#CRT-9120",
      certificate: "Matrícula de Imóvel Atualizada",
      type: "Registro de Imóveis",
      client: "Dr. Marcelo Fagundes (Proc. 1024-2026)",
      cartorio: "9º RGI da Capital - Rio de Janeiro (RJ)",
      cns: "088096",
      status: "EM_PROCESSAMENTO",
      deadline: "Hoje, 17h",
      price: "R$ 194,50",
    },
    {
      id: "req-2",
      protocol: "#CRT-9118",
      certificate: "Certidão de Nascimento (Breve Relato)",
      type: "Registro Civil",
      client: "Inventário Família Prado",
      cartorio: "1º Subdistrito - Sé - São Paulo (SP)",
      cns: "111328",
      status: "EM_ANALISE",
      deadline: "Amanhã",
      price: "R$ 148,90",
    },
    {
      id: "req-3",
      protocol: "#CRT-9102",
      certificate: "Escritura Pública Declaratória",
      type: "Notas",
      client: "Auditoria Imobiliária Jardim Europa",
      cartorio: "14º Tabelião de Notas - São Paulo (SP)",
      cns: "110635",
      status: "COM_PENDENCIA",
      deadline: "Exigência",
      price: "R$ 178,00",
    },
    {
      id: "req-4",
      protocol: "#CRT-9080",
      certificate: "Certidão Negativa de Testamento",
      type: "Notas (CENSEC)",
      client: "Dra. Beatriz Vasconcelos",
      cartorio: "Colégio Notarial do Brasil (CENSEC)",
      cns: "000001",
      status: "CONCLUIDA",
      deadline: "Emitida",
      price: "R$ 115,00",
    },
    {
      id: "req-5",
      protocol: "#CRT-9072",
      certificate: "Certidão de Casamento com Averbação",
      type: "Registro Civil",
      client: "Ação de Divórcio Consensual",
      cartorio: "2º Subdistrito - Liberdade - São Paulo (SP)",
      cns: "111336",
      status: "CONCLUIDA",
      deadline: "Emitida",
      price: "R$ 152,00",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Contextual Toolbar */}
      <PageHeader
        title="Painel Operacional"
        description="Acompanhe o ciclo de vida das certidões, prazos de expedição e exigências pendentes nos cartórios."
        badge={
          <Badge variant="brand" size="sm">
            Silveira & Associados • B2B
          </Badge>
        }
        actions={
          <IconBar
            items={[
              {
                id: "nova-solic",
                label: "Nova Solicitação",
                icon: <Plus className="w-4 h-4" />,
                variant: "primary",
                onClick: () => setIsNewRequestOpen(true),
              },
              {
                id: "busca-cns",
                label: "Consultar Cartórios CNJ",
                icon: <Search className="w-4 h-4" />,
                onClick: () => {},
              },
              {
                id: "export",
                label: "Exportar Relatório",
                icon: <Download className="w-4 h-4" />,
                onClick: () => {},
              },
            ]}
          />
        }
      />

      {/* 4 Metric Cards (Operational Numbers) */}
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

      {/* Split Section: AttentionPanel (Left) + DeadlineList (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttentionPanel
            items={attentionItems}
            onViewAll={() => {}}
          />
        </div>
        <div className="lg:col-span-1">
          <DeadlineList items={deadlineItems} />
        </div>
      </div>

      {/* Main Operational Data Table */}
      <Card padding="none">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
              Solicitações Recentes
            </h3>
            <span className="text-[10px] font-bold text-brand-950 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
              28 Ativas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar nesta página..."
                className="h-8 pl-8 pr-3 text-xs bg-neutral-0 border border-neutral-300 rounded-md focus:outline-none focus:border-brand-500 w-52"
              />
            </div>
            <Button size="sm" variant="outline" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
              Filtros
            </Button>
          </div>
        </div>

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
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-semibold text-neutral-900">
                  {order.protocol}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-neutral-900">{order.certificate}</div>
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
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
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
                      },
                      "separator",
                      {
                        id: "support",
                        label: "Contatar Despachante",
                        icon: <HelpCircle className="w-3.5 h-3.5" />,
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={6}
          totalItems={28}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* New Request Modal */}
      <Dialog isOpen={isNewRequestOpen} onClose={() => setIsNewRequestOpen(false)} size="md">
        <DialogHeader onClose={() => setIsNewRequestOpen(false)}>
          <DialogTitle>Nova Emissão Notarial B2B</DialogTitle>
          <DialogDescription>
            Inicie um novo pedido consolidado de certidões para a sua organização.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <Input
            label="Referência do Processo / Imóvel"
            placeholder="Ex: Ação 00412-2026 / Edifício Horizon"
            helperText="Código interno para localização em relatórios e faturas"
            required
          />
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-md text-xs text-brand-950 space-y-1">
            <span className="font-semibold block">Emissão Multi-Cartórios</span>
            <p className="text-neutral-600">
              Você poderá adicionar múltiplas certidões de diferentes cartórios e estados em uma única fatura.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setIsNewRequestOpen(false)}>
            Continuar para Seleção de Certidões
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Request Details Sheet */}
      {selectedRequestDetails && (
        <Sheet
          isOpen={Boolean(selectedRequestDetails)}
          onClose={() => setSelectedRequestDetails(null)}
          size="md"
        >
          <SheetHeader onClose={() => setSelectedRequestDetails(null)}>
            <SheetTitle>Dossiê Notarial {selectedRequestDetails.protocol}</SheetTitle>
            <SheetDescription>{selectedRequestDetails.certificate}</SheetDescription>
          </SheetHeader>
          <SheetContent className="space-y-4 text-xs">
            <div className="space-y-2 p-3 bg-neutral-50 rounded-md border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status Operacional:</span>
                <RequestStatus status={selectedRequestDetails.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Serventia / Cartório:</span>
                <span className="font-semibold text-neutral-900">{selectedRequestDetails.cartorio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Código CNS do CNJ:</span>
                <span className="font-mono font-semibold">{selectedRequestDetails.cns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cliente / Organização:</span>
                <span className="font-medium text-neutral-900">{selectedRequestDetails.client}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-neutral-900">Histórico de Tramitação</h4>
              <div className="space-y-2 pl-2 border-l-2 border-brand-950">
                <div className="space-y-0.5">
                  <span className="font-semibold text-neutral-900 block">Pedido Prenotado no Cartório</span>
                  <span className="text-[10px] text-neutral-400">27/08/2026 às 14:22</span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold text-neutral-900 block">Validação Inicial da Taxa Notarial</span>
                  <span className="text-[10px] text-neutral-400">27/08/2026 às 11:05</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
