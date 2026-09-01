import { CartItem } from "@/lib/types";
import { cartTotals } from "@/lib/pricing";

export const CART_STORAGE_KEY = "cartori.cart.v1";

export function emptyCart() {
  return {
    items: [] as CartItem[],
    itemsSubtotal: 0,
    shippingSubtotal: 0,
    total: 0,
  };
}

export function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const totals = cartTotals(items);
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      items,
      ...totals,
    })
  );
}

export function clearCartStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
}
