/** CSV para Excel em pt-BR: separador ;, BOM para os acentos e células que nunca viram fórmula. */

export function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  // Prefixo ' impede que =, +, - ou @ no início sejam lidos como fórmula.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(header: string[], rows: Array<Array<string | number | null | undefined>>) {
  return "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
}

export function formatCsvDate(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/** Só no navegador: baixa o CSV com a data do dia no nome. */
export function downloadCsv(baseName: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
