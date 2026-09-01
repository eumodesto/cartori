"use client";

import * as React from "react";
import { CartItem } from "@/lib/types";
import { cartTotals } from "@/lib/pricing";
import { loadCartItems, saveCartItems } from "@/lib/cart-storage";

interface CartContextValue {
  items: CartItem[];
  itemsSubtotal: number;
  shippingSubtotal: number;
  total: number;
  itemCount: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setItems(loadCartItems());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    saveCartItems(items);
  }, [items, hydrated]);

  const value = React.useMemo<CartContextValue>(() => {
    const totals = cartTotals(items);
    return {
      items,
      ...totals,
      itemCount: items.length,
      hydrated,
      addItem: (item) => setItems((prev) => [...prev, item]),
      removeItem: (id) => setItems((prev) => prev.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
