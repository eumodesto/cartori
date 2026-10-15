import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Criar nova senha | InterJuri",
  robots: { index: false, follow: false },
};

export default function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <StorefrontShell>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-md px-4">
          <ResetPasswordForm next={searchParams?.next} />
        </div>
      </section>
    </StorefrontShell>
  );
}
