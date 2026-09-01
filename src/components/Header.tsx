"use client";

import Link from "next/link";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-0/95 backdrop-blur border-b border-slate-200 dark:border-neutral-200 shadow-sm">
      {/* Top Banner Oficial */}
      <div className="bg-primary-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Documentos oficiais válidos em todo o território nacional • Assinatura Digital ICP-Brasil</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>Atendimento Notarial 24h</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center group py-1">
          {/* Mobile Icon */}
          <img
            src="/favicon.svg"
            alt="Cartori"
            className="h-9 w-9 object-contain sm:hidden group-hover:scale-105 transition-transform"
          />
          {/* Desktop Horizontal Logo */}
          <img
            src="/logo-horizontal.svg"
            alt="Cartori - Hub de Serviços Notariais"
            className="h-10 sm:h-11 w-auto object-contain hidden sm:block group-hover:scale-[1.02] transition-transform dark:brightness-0 dark:invert"
          />
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700 dark:text-neutral-700">
          <Link href="#certidoes" className="hover:text-primary-600 dark:hover:text-brand-400 transition-colors">
            Certidões
          </Link>
          <Link href="#como-funciona" className="hover:text-primary-600 dark:hover:text-brand-400 transition-colors">
            Como Funciona
          </Link>
          <Link href="#faq" className="hover:text-primary-600 dark:hover:text-brand-400 transition-colors">
            Dúvidas
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <UserMenu side="bottom" size="sm" />

          <Link
            href="/carrinho"
            className="relative flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Pedido</span>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-primary-950 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
