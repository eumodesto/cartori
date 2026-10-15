"use client";

import * as React from "react";
import type { PublicOrder } from "@/lib/order-status";

type TagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  google_tag_manager?: Record<string, unknown>;
};

const storageKey = (orderId: string) => `cartori:purchase-tracked:${orderId}`;

function alreadyTracked(orderId: string) {
  try {
    return window.localStorage.getItem(storageKey(orderId)) === "1";
  } catch {
    return false;
  }
}

function markTracked(orderId: string) {
  try {
    window.localStorage.setItem(storageKey(orderId), "1");
  } catch {
    // sem storage (navegação privada): o transaction_id ainda deduplica no Google
  }
}

function hasGtmContainer(w: TagWindow) {
  return Object.keys(w.google_tag_manager || {}).some((key) => key.startsWith("GTM-"));
}

async function waitForTags(timeoutMs = 6000): Promise<TagWindow | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const w = window as TagWindow;
    if (w.gtag || hasGtmContainer(w)) return w;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

/**
 * Registra a compra: GA4 `purchase` e conversão do Google Ads via gtag, e evento `purchase`
 * no dataLayer quando há contêiner do Tag Manager. Só deve ser montado para pedido pago.
 * O protocolo é o transaction_id: recarregar ou abrir em outro aparelho não conta de novo.
 */
export function PurchaseConversion({
  order,
  adsSendTo,
}: {
  order: PublicOrder;
  adsSendTo: string | null;
}) {
  React.useEffect(() => {
    if (alreadyTracked(order.id)) return;

    let cancelled = false;
    waitForTags().then((w) => {
      if (cancelled || !w || alreadyTracked(order.id)) return;

      const value = Number(order.totalAmount.toFixed(2));
      const items = order.items.map((item) => ({
        item_id: item.id,
        item_name: item.certificateName,
        price: item.totalPrice,
        quantity: 1,
      }));

      if (w.gtag) {
        w.gtag("event", "purchase", {
          transaction_id: order.protocol,
          value,
          currency: "BRL",
          items,
        });
        if (adsSendTo) {
          w.gtag("event", "conversion", {
            send_to: adsSendTo,
            transaction_id: order.protocol,
            value,
            currency: "BRL",
          });
        }
      }

      if (hasGtmContainer(w)) {
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ ecommerce: null });
        w.dataLayer.push({
          event: "purchase",
          ecommerce: { transaction_id: order.protocol, value, currency: "BRL", items },
        });
      }

      markTracked(order.id);
    });

    return () => {
      cancelled = true;
    };
  }, [order, adsSendTo]);

  return null;
}
