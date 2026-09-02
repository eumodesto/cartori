"use client";

import Link from "next/link";
import { Trash2, Plus } from "lucide-react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { OrderSummary } from "@/components/storefront/order-summary";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function CarrinhoPage() {
  const { items, itemsSubtotal, shippingSubtotal, total, removeItem, hydrated } = useCart();

  return (
    <StorefrontShell>
      <section className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
              Vitrine Cartori
            </p>
            <h1 className="text-3xl font-serif font-bold text-neutral-900">Pedido</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Revise as certidões antes do checkout. Você pode incluir mais itens e pagar tudo de uma vez.
            </p>
          </div>

          {!hydrated ? (
            <p className="text-sm text-neutral-500">Carregando pedido...</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-0 px-6 py-16 text-center space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900">Nenhuma certidão no pedido</h2>
              <p className="text-sm text-neutral-500">
                Escolha o tipo de certidão, informe o cartório e os dados do documento.
              </p>
              <Link href="/#certidoes">
                <Button>Ver catálogo</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                          {item.categoryName}
                        </p>
                        <h2 className="text-base font-semibold text-neutral-900">
                          {item.certificateName}
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                          {item.city}/{item.state}
                          {item.cartorioName ? ` · ${item.cartorioName}` : ""}
                        </p>
                        {item.referenceTag && (
                          <p className="text-xs text-neutral-600 mt-1">
                            Ref.: {item.referenceTag}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-md text-neutral-400 hover:text-semantic-error hover:bg-semantic-error-bg"
                        aria-label={`Remover ${item.certificateName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-neutral-600">
                      <span className="px-2 py-1 rounded-md bg-neutral-100 border border-neutral-200">
                        {item.format === "DIGITAL_ECERTIDAO"
                          ? "Digital"
                          : item.format === "PHYSICAL_PAPER"
                          ? "Papel moeda"
                          : "Digital + físico"}
                      </span>
                      {item.hasApostille && (
                        <span className="px-2 py-1 rounded-md bg-neutral-100 border border-neutral-200">
                          Apostilamento
                        </span>
                      )}
                      {(item.extrasPrice || 0) > 0 && (
                        <span className="px-2 py-1 rounded-md bg-neutral-100 border border-neutral-200">
                          Extras {formatCurrency(item.extrasPrice || 0)}
                        </span>
                      )}
                      {item.isUnknownCartorio && (
                        <span className="px-2 py-1 rounded-md bg-neutral-100 border border-neutral-200">
                          Busca de serventia
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <span className="text-xs text-neutral-500">Subtotal do item</span>
                      <span className="text-sm font-bold text-neutral-900">
                        {formatCurrency(item.itemTotal)}
                      </span>
                    </div>
                  </article>
                ))}

                <Link
                  href="/#certidoes"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-800 hover:text-brand-950"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar outra certidão
                </Link>
              </div>

              <div className="lg:col-span-5">
                <OrderSummary
                  items={items}
                  itemsSubtotal={itemsSubtotal}
                  shippingSubtotal={shippingSubtotal}
                  total={total}
                  cta={
                    <Link href="/checkout" className="block">
                      <Button className="w-full" size="lg">
                        Ir para checkout
                      </Button>
                    </Link>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </StorefrontShell>
  );
}
