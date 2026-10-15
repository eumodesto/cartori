import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront/storefront-home";
import { JsonLd } from "@/components/seo/json-ld";
import {
  certificateFromParam,
  certificatePath,
  firstSearchParam,
} from "@/lib/certificate-links";
import { faqJsonLd } from "@/lib/seo";
import { STOREFRONT_FAQ } from "@/lib/storefront-faq";

export const dynamic = "force-dynamic";

type HomeSearchParams = {
  certidao?: string | string[];
  servico?: string | string[];
};

function certificateFromSearch(searchParams: HomeSearchParams) {
  return certificateFromParam(
    firstSearchParam(searchParams.certidao) || firstSearchParam(searchParams.servico)
  );
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}): Metadata {
  const cert = certificateFromSearch(searchParams);
  return { alternates: { canonical: cert ? certificatePath(cert.slug) : "/" } };
}

export default function HomePage({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const cert = certificateFromSearch(searchParams);
  return (
    <>
      <JsonLd data={faqJsonLd(STOREFRONT_FAQ)} />
      <StorefrontHome initialCertificateSlug={cert?.slug} />
    </>
  );
}
