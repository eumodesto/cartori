import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront/storefront-home";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo";
import { STOREFRONT_FAQ } from "@/lib/storefront-faq";

// Estática: servida do cache da borda. Links antigos /?certidao= e /?servico= são
// redirecionados no middleware para /certidao/[slug].
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(STOREFRONT_FAQ)} />
      <StorefrontHome />
    </>
  );
}
