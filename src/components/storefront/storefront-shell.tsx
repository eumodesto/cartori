"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/components/cart/cart-provider";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={itemCount} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
