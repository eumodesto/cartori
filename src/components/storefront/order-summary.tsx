"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CartItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function OrderSummary({
  items,
  itemsSubtotal,
  shippingSubtotal,
  total,
  cta,
}: {
  items: CartItem[];
  itemsSubtotal: number;
  shippingSubtotal: number;
  total: number;
  cta?: ReactNode;
}) {
  return (
    <aside className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-4 h-fit sticky top-28">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          Resumo do pedido
        </p>
        <h2 className="text-lg font-serif font-bold text-neutral-900">
          {items.length} {items.length === 1 ? "certidão" : "certidões"}
        </h2>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 leading-snug">
                  {item.certificateName}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.city}/{item.state}
                  {item.cartorioName ? ` · ${item.cartorioName}` : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-neutral-900 shrink-0">
                {formatCurrency(item.itemTotal)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-neutral-200 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Certidões e serviços</span>
          <span>{formatCurrency(itemsSubtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Envio físico</span>
          <span>
            {shippingSubtotal > 0 ? formatCurrency(shippingSubtotal) : "Incluso no digital"}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold text-neutral-900 pt-1">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {cta}

      <p className="text-[11px] text-neutral-500 leading-relaxed">
        Pagamento único via Mercado Pago. Após a confirmação, o pedido entra na
        fila de emissão. Acompanhe depois em{" "}
        <Link href="/dashboard" className="underline underline-offset-2">
          /dashboard
        </Link>
        .
      </p>
    </aside>
  );
}
