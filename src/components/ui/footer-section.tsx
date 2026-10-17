"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeHashLink } from "@/components/storefront/home-hash-link";
import { BusinessSignupLink } from "@/components/auth/business-signup-link";
import type { ReactNode } from "react";
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
      {/* Fundo a 10px das laterais e do fim da página; o conteúdo mantém a largura de max-w-7xl. */}
      <div className="px-[10px] pb-[10px] pt-0 sm:pt-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 text-neutral-300 shadow-[0_18px_50px_rgba(2,31,80,0.22),inset_0_1px_0_rgba(255,255,255,0.28)] md:rounded-[2rem]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-brand-950"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_18%,rgba(0,109,253,0.2)_42%,rgba(2,31,80,0)_70%)]"
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

          {/* Padding = antigo recuo do card (0 / 24 / 32px) − 10px de recuo − 1px de borda + padding interno (24 / 40 / 56px). */}
          <div className="relative mx-auto w-full max-w-[1258px] px-[13px] py-10 sm:px-[53px] sm:py-12 lg:px-[77px] lg:py-16">
            <div className="flex w-full flex-col gap-10">
              <AnimatedContainer className="w-full space-y-4">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src="/brand/interjuri-logo.png"
                    alt="InterJuri"
                    width={619}
                    height={176}
                    sizes="113px"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </Link>
                <div className="max-w-3xl space-y-3 text-neutral-400 text-sm leading-relaxed">
                  <p>
                    A InterJuri é uma empresa privada e independente, sem vínculo, afiliação ou representação de órgãos públicos, cartórios, tribunais ou entidades governamentais.
                  </p>
                  <p>
                    Prestamos serviço de intermediação e facilitação para solicitação de certidões e documentos junto aos órgãos e serventias responsáveis pela emissão.
                  </p>
                  <p>
                    Os documentos também podem ser solicitados diretamente aos respectivos órgãos ou cartórios competentes. Os valores cobrados pela InterJuri podem incluir taxas de serviço, atendimento, processamento e intermediação, além dos emolumentos e demais custos cobrados pelo órgão emissor, quando aplicáveis.
                  </p>
                  <p>
                    A emissão, conteúdo, validade e prazo de disponibilização dos documentos são de responsabilidade do órgão ou serventia competente.
                  </p>
                </div>
              </AnimatedContainer>

              <div aria-hidden className="h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
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
                © 2026 INTERJURI. CARTORE EXPRESS LTDA - EPP. CNPJ 57.448.583/0001-35. Todos os direitos reservados.
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
  className?: string;
  children: ReactNode;
};

/** Antes animado com framer-motion (~108 KB de JS em toda página); agora estático. */
function AnimatedContainer({ className, children }: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
}
