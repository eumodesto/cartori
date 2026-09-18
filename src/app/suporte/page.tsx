import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Clock,
  Facebook,
  Instagram,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Shield,
} from "lucide-react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  SUPPORT_CHANNELS,
  SUPPORT_COMPANY,
  SUPPORT_EMAIL,
} from "@/lib/support-contacts";

export const metadata: Metadata = {
  title: "Suporte e contato | Cartori",
  description:
    "Todos os canais oficiais de atendimento da Cartori: e-mail, DPO, chat Amanda, painel da conta e redes sociais.",
};

const ICONS = {
  atendimento: Mail,
  dpo: Shield,
  amanda: MessageCircle,
  conta: LayoutDashboard,
  instagram: Instagram,
  facebook: Facebook,
} as const;

export default function SuportePage() {
  return (
    <StorefrontShell>
      <article className="bg-surface-page py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            className="mb-6"
            items={[
              { label: "Início", href: "/" },
              { label: "Suporte", isCurrent: true },
            ]}
          />

          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
            Atendimento
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            Suporte Cartori
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 leading-relaxed">
            Canais oficiais da {SUPPORT_COMPANY.legalName}, operadora do Cartori.com.br.
            Use o e-mail de atendimento para pedidos e cancelamentos; o DPO para dados pessoais;
            o chat Amanda para dúvidas rápidas.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORT_CHANNELS.map((channel) => {
              const Icon = ICONS[channel.id];
              const body = (
                <>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800 border border-brand-200">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-neutral-900 font-serif">
                    {channel.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                    {channel.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-brand-800 group-hover:underline underline-offset-2">
                    {channel.action}
                  </p>
                </>
              );
              const className =
                "group rounded-2xl border border-neutral-200 bg-neutral-0 p-5 hover:border-brand-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

              if (channel.id === "amanda") {
                return (
                  <div key={channel.id} id="amanda" className={className}>
                    {body}
                  </div>
                );
              }

              return (
                <Link
                  key={channel.id}
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={className}
                >
                  {body}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-brand-800">
                <Clock className="w-4 h-4" aria-hidden />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Horário</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                {SUPPORT_COMPANY.hours}. Pedidos e mensagens no painel ficam registrados na
                conta. Cancelamentos pelo e-mail {SUPPORT_EMAIL}.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-brand-800">
                <Building2 className="w-4 h-4" aria-hidden />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Empresa</h2>
              </div>
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                {SUPPORT_COMPANY.legalName}. CNPJ {SUPPORT_COMPANY.cnpj}. Sede em{" "}
                {SUPPORT_COMPANY.city}.
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                A Cartori é empresa privada de intermediação documental — não é cartório oficial.
              </p>
            </section>
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            <Link href="/#faq" className="text-brand-800 hover:underline">
              Perguntas frequentes
            </Link>
            {" · "}
            <Link href="/termos" className="text-brand-800 hover:underline">
              Termos de uso
            </Link>
            {" · "}
            <Link href="/privacidade" className="text-brand-800 hover:underline">
              Privacidade (LGPD)
            </Link>
          </p>
        </div>
      </article>
    </StorefrontShell>
  );
}
