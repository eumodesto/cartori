"use client";

import * as React from "react";
import Link from "next/link";
import { HomeHashLink } from "@/components/storefront/home-hash-link";
import { BusinessSignupLink } from "@/components/auth/business-signup-link";
import { FOOTER_CERTIFICATE_LINKS, certificatePath } from "@/lib/certificate-links";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Facebook, Instagram } from "lucide-react";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/support-contacts";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSectionData {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSectionData[] = [
  {
    label: "Certidões",
    links: FOOTER_CERTIFICATE_LINKS.map((item) => ({
      title: item.title,
      href: certificatePath(item.slug),
    })),
  },
  {
    label: "Empresa",
    links: [
      { title: "Para Advogados & Imobiliárias", href: "/#como-funciona" },
      { title: "Termos de Uso", href: "/termos" },
      { title: "Privacidade (LGPD)", href: "/privacidade" },
      { title: "Suporte", href: "/suporte" },
    ],
  },
  {
    label: "Recursos",
    links: [
      { title: "Catálogo de Serviços", href: "/#certidoes" },
      { title: "Painel B2B", href: "/?cadastro=empresa" },
      { title: "Como Funciona", href: "/#como-funciona" },
    ],
  },
  {
    label: "Redes",
    links: [
      { title: "Facebook", href: FACEBOOK_URL, icon: Facebook },
      { title: "Instagram", href: INSTAGRAM_URL, icon: Instagram },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 text-neutral-300 shadow-[0_18px_50px_rgba(1,30,55,0.22),inset_0_1px_0_rgba(255,255,255,0.28)] md:rounded-[2rem]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-brand-950"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_18%,rgba(8,118,165,0.18)_42%,rgba(1,30,55,0)_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_180px_at_50%_-20px,rgba(255,255,255,0.28),transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-24 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_28%,rgba(0,0,0,0.18)_100%)]"
          />

          <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="flex w-full flex-col gap-10">
              <AnimatedContainer className="w-full space-y-4">
                <Link href="/" className="inline-flex items-center">
                  <img
                    src="/logo-horizontal.svg"
                    alt="Cartori"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </Link>
                <p className="max-w-3xl text-neutral-400 text-sm leading-relaxed">
                  A Cartori é a vitrine online para solicitar certidões de nascimento, casamento, óbito, notas, imóveis e protesto — além de TRF, TRT e CCIR. O pedido é pago por PIX ou cartão no Mercado Pago. Cuidamos da diligência operacional junto ao cartório ou órgão: busca da serventia, emissão e envio digital ou em papel.
                </p>
              </AnimatedContainer>

              <div aria-hidden className="h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
                {footerLinks.map((section, index) => (
                  <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-0 font-sans">{section.label}</h3>
                      <ul className="text-neutral-400 mt-4 space-y-2 text-sm">
                        {section.links.map((link) => {
                          const hash = link.href.startsWith("/#") ? link.href.slice(2) : null;
                          const className =
                            "hover:text-neutral-0 inline-flex items-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm";
                          return (
                          <li key={link.title}>
                            {link.title === "Para Advogados & Imobiliárias" ||
                            link.title === "Painel B2B" ? (
                              <BusinessSignupLink className={className}>
                                {link.title}
                              </BusinessSignupLink>
                            ) : hash ? (
                              <HomeHashLink hash={hash} className={className}>
                                {link.icon && <link.icon className="me-1 size-4" />}
                                {link.title}
                              </HomeHashLink>
                            ) : (
                            <Link
                              href={link.href}
                              {...(link.href.startsWith("http")
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className={className}
                            >
                              {link.icon && <link.icon className="me-1 size-4" />}
                              {link.title}
                            </Link>
                            )}
                          </li>
                        );
                        })}
                      </ul>
                    </div>
                  </AnimatedContainer>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-neutral-400 text-sm">
                © 2026 CARTORI. CARTORE EXPRESS LTDA - EPP. CNPJ 57.448.583/0001-35. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
