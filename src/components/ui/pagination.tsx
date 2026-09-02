import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  itemLabel = "registros",
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || currentPage * itemsPerPage);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-2 text-xs text-neutral-600",
        className
      )}
    >
      {totalItems !== undefined && (
        <p className="text-neutral-500">
          Mostrando <span className="font-semibold text-neutral-900">{startItem}</span> a{" "}
          <span className="font-semibold text-neutral-900">{endItem}</span> de{" "}
          <span className="font-semibold text-neutral-900">{totalItems}</span> {itemLabel}
        </p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="Primeira página"
          className="p-1.5 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className="p-1.5 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 font-medium text-neutral-800">
          Página <span className="font-semibold">{currentPage}</span> de{" "}
          <span className="font-semibold">{totalPages || 1}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Próxima página"
          className="p-1.5 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Última página"
          className="p-1.5 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
