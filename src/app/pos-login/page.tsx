import { redirect } from "next/navigation";
import { getAuthProfile } from "@/lib/auth";
import { safeAppPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Gateway pós-login: decide o "pouso" por papel, honrando um `next` válido e permitido.
 * A URL não concede acesso — cada seção tem sua própria guarda. Aqui só escolhemos o destino.
 */
function landingForRole(role: string): string {
  if (role === "ADMIN") return "/admin/usuarios";
  if (role === "OPERATOR") return "/operacao/pedidos";
  return "/painel";
}

function nextAllowedForRole(next: string, role: string): boolean {
  if (next.startsWith("/admin")) return role === "ADMIN";
  if (next.startsWith("/operacao")) return role === "ADMIN" || role === "OPERATOR";
  return true;
}

export default async function PosLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const profile = await getAuthProfile();
  const nextParam = safeAppPath(searchParams?.next, "");

  if (!profile) {
    redirect(`/?entrar=1${nextParam ? `&next=${encodeURIComponent(nextParam)}` : ""}`);
  }

  const fallback = landingForRole(profile.role);
  const destination =
    nextParam && nextParam !== "/pos-login" && nextAllowedForRole(nextParam, profile.role)
      ? nextParam
      : fallback;

  redirect(destination);
}
