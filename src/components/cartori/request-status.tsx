import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";

export type OrderStatusKey =
  | "SOLICITADA"
  | "EM_ANALISE"
  | "EM_PROCESSAMENTO"
  | "AGUARDANDO_CLIENTE"
  | "COM_PENDENCIA"
  | "CONCLUIDA"
  | "CANCELADA"
  | "ERRO";

export interface RequestStatusProps {
  status: OrderStatusKey | string;
  size?: "sm" | "md";
  className?: string;
}

export const RequestStatus: React.FC<RequestStatusProps> = ({
  status,
  size = "md",
  className,
}) => {
  const statusConfig: Record<
    string,
    { semantic: StatusType; label: string }
  > = {
    SOLICITADA: { semantic: "neutral", label: "Solicitada" },
    EM_ANALISE: { semantic: "info", label: "Em Análise Notarial" },
    EM_PROCESSAMENTO: { semantic: "info", label: "Em Processamento no Cartório" },
    AGUARDANDO_CLIENTE: { semantic: "warning", label: "Aguardando Cliente" },
    COM_PENDENCIA: { semantic: "warning", label: "Com Pendência / Diligência" },
    CONCLUIDA: { semantic: "success", label: "Certidão Concluída" },
    CANCELADA: { semantic: "neutral", label: "Cancelada" },
    ERRO: { semantic: "error", label: "Erro / Rejeitada" },
  };

  const config = statusConfig[status.toUpperCase()] || {
    semantic: "neutral" as StatusType,
    label: status,
  };

  return (
    <StatusBadge
      status={config.semantic}
      label={config.label}
      size={size}
      className={className}
    />
  );
};
