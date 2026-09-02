"use client";

import * as React from "react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

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
    links: [
      { title: "Nascimento", href: "#certidoes" },
      { title: "Casamento", href: "#certidoes" },
      { title: "Óbito", href: "#certidoes" },
      { title: "Negativa de Testamento", href: "#certidoes" },
      { title: "Matrícula de Imóvel", href: "#certidoes" },
      { title: "Protesto", href: "#certidoes" },
    ],
  },
  {
    label: "Empresa",
    links: [
      { title: "Para Advogados & Imobiliárias", href: "#b2b" },
      { title: "Termos de Uso", href: "/termos" },
      { title: "Privacidade (LGPD)", href: "/privacidade" },
      { title: "Suporte", href: "/contato" },
    ],
  },
  {
    label: "Recursos",
    links: [
      { title: "Catálogo de Serviços", href: "#certidoes" },
      { title: "Painel B2B", href: "/dashboard" },
      { title: "Como Funciona", href: "#b2b" },
      { title: "Ajuda", href: "/contato" },
    ],
  },
  {
    label: "Redes",
    links: [
      { title: "Facebook", href: "#", icon: Facebook },
      { title: "Instagram", href: "#", icon: Instagram },
      { title: "YouTube", href: "#", icon: Youtube },
      { title: "LinkedIn", href: "#", icon: Linkedin },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-brand-950 pt-2 text-neutral-300">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10px] top-2 bottom-0 overflow-hidden rounded-t-[2rem] border border-b-0 border-white/15 bg-white/[0.08] shadow-[0_-24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:rounded-t-[3rem]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(50%_140px_at_50%_0%,rgba(255,255,255,0.18),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex w-full flex-col gap-8">
          <AnimatedContainer className="w-full space-y-4">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logo-horizontal.svg"
                alt="Cartori"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="w-full max-w-none text-neutral-400 text-sm leading-relaxed">
              A Cartori é a vitrine online para solicitar certidões de nascimento, casamento, óbito, notas, imóveis e protesto — além de TRF, TRT e CCIR. O pedido é pago por PIX ou cartão no Mercado Pago. Cuidamos da diligência operacional junto ao cartório ou órgão: busca da serventia, emissão e envio digital ou em papel.
            </p>
          </AnimatedContainer>

          <div aria-hidden className="h-px bg-white/10" />

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerLinks.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                <div className="mb-10 md:mb-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-0 font-sans">{section.label}</h3>
                  <ul className="text-neutral-400 mt-4 space-y-2 text-sm">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          className="hover:text-neutral-0 inline-flex items-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
                        >
                          {link.icon && <link.icon className="me-1 size-4" />}
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-neutral-400 text-sm">
            © 2026 CARTORI. Todos os direitos reservados.
          </p>
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
