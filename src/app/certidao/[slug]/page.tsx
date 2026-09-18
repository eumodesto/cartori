import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCertificateBySlug } from "@/lib/catalog";
import {
  certificateQueryPath,
  listCertificatePathParams,
  resolveCertificateSlug,
} from "@/lib/certificate-links";

type Params = { slug: string };

export function generateStaticParams() {
  return listCertificatePathParams();
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const slug = resolveCertificateSlug(params.slug);
  const cert = slug ? getCertificateBySlug(slug) : undefined;
  if (!cert) {
    return { title: "Catálogo de certidões | Cartori" };
  }
  return {
    title: `${cert.name} | Cartori`,
    description: cert.shortDescription,
  };
}

export default function CertificateLandingPage({ params }: { params: Params }) {
  const slug = resolveCertificateSlug(params.slug);
  if (!slug) redirect("/#certidoes");
  redirect(certificateQueryPath(slug));
}
