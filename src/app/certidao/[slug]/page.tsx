import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import {
  CertificateLanding,
  certificateLandingTitle,
} from "@/components/storefront/certificate-landing";
import { StorefrontHome } from "@/components/storefront/storefront-home";
import { getCertificateBySlug } from "@/lib/catalog";
import {
  certificatePath,
  listCertificatePathParams,
  resolveCertificateSlug,
} from "@/lib/certificate-links";
import {
  OG_IMAGE,
  breadcrumbJsonLd,
  certificateSeoDescription,
  certificateSeoTitle,
  certificateServiceJsonLd,
} from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return listCertificatePathParams();
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const slug = resolveCertificateSlug(params.slug);
  const cert = slug ? getCertificateBySlug(slug) : undefined;
  if (!cert) {
    return { title: "Catálogo de certidões | Cartori", robots: { index: false } };
  }
  const title = certificateSeoTitle(cert);
  const description = certificateSeoDescription(cert);
  const canonical = certificatePath(cert.slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [OG_IMAGE] },
  };
}

export const dynamicParams = true;

export default function CertificateLandingPage({ params }: { params: Params }) {
  const slug = resolveCertificateSlug(params.slug);
  const cert = slug ? getCertificateBySlug(slug) : undefined;
  if (!slug || !cert) redirect("/#certidoes");
  return (
    <>
      <JsonLd
        data={[
          certificateServiceJsonLd(cert),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: cert.name, path: certificatePath(cert.slug) },
          ]),
        ]}
      />
      <StorefrontHome
        initialCertificateSlug={slug}
        landingHero={{ title: certificateLandingTitle(cert), summary: cert.shortDescription }}
        landingContent={<CertificateLanding cert={cert} />}
      />
    </>
  );
}
