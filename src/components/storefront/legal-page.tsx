import type { ReactNode } from "react";
import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export function LegalPage({
  crumb,
  kicker,
  title,
  lede,
  children,
}: {
  crumb: string;
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <StorefrontShell>
      <article className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            className="mb-6"
            items={[
              { label: "Início", href: "/" },
              { label: crumb, isCurrent: true },
            ]}
          />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
            {kicker}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{lede}</p>
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-0 p-6 sm:p-8 space-y-8 text-[15px] leading-relaxed text-neutral-800">
            {children}
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            <Link href="/termos" className="text-brand-800 hover:underline">
              Termos de uso
            </Link>
            {" · "}
            <Link href="/privacidade" className="text-brand-800 hover:underline">
              Política de privacidade
            </Link>
            {" · "}
            <Link href="/suporte" className="text-brand-800 hover:underline">
              Suporte
            </Link>
            {" · "}
            <Link href="mailto:atendimento@cartori.com.br" className="text-brand-800 hover:underline">
              atendimento@cartori.com.br
            </Link>
          </p>
        </div>
      </article>
    </StorefrontShell>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-lg font-serif font-bold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

export function LegalMail({ href, children }: { href: string; children: string }) {
  return (
    <a href={`mailto:${href}`} className="text-brand-800 font-medium underline underline-offset-2">
      {children}
    </a>
  );
}
