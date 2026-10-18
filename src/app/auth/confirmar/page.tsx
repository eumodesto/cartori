import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ConfirmLinkCard } from "./confirm-link-card";

export const metadata: Metadata = {
  title: "Confirmar acesso | InterJuri",
  robots: { index: false, follow: false },
};

export default function ConfirmarPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; next?: string };
}) {
  return (
    <StorefrontShell>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-md px-4">
          <ConfirmLinkCard
            tokenHash={searchParams?.token_hash ?? ""}
            type={searchParams?.type ?? ""}
            next={searchParams?.next ?? "/painel"}
          />
        </div>
      </section>
    </StorefrontShell>
  );
}
