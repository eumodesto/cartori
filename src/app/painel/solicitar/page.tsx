import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/lib/auth";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import { PRIVATE_CERTIFICATES } from "@/lib/private-catalog";
import { RequestCatalog } from "./request-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitar certidão | InterJuri",
  robots: { index: false, follow: false },
};

/**
 * Catálogo completo da área logada: inclui as certidões privadas (Registro Civil).
 * A lista só sai do servidor depois de confirmar a sessão; anônimo não recebe os dados.
 */
export default async function SolicitarCertidaoPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect(`/?entrar=1&next=${encodeURIComponent("/painel/solicitar")}`);

  return <RequestCatalog certificates={[...PRIVATE_CERTIFICATES, ...MVP_CERTIFICATES]} />;
}
