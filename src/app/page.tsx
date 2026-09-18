import { StorefrontHome } from "@/components/storefront/storefront-home";
import {
  certificateFromParam,
  firstSearchParam,
} from "@/lib/certificate-links";

export const dynamic = "force-dynamic";

type HomeSearchParams = {
  certidao?: string | string[];
  servico?: string | string[];
};

export default function HomePage({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const cert = certificateFromParam(
    firstSearchParam(searchParams.certidao) || firstSearchParam(searchParams.servico)
  );
  return <StorefrontHome initialCertificateSlug={cert?.slug} />;
}
