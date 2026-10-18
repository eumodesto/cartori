import { prisma } from "@/lib/prisma";
import { SEEN_WRITE_INTERVAL_MS } from "@/lib/presence-rules";

/** Grava o login (rotas de login, confirmação de e-mail e OAuth). Nunca lança. */
export async function recordLogin(userId: string) {
  const now = new Date();
  await prisma.user
    .update({ where: { id: userId }, data: { lastLoginAt: now, lastSeenAt: now } })
    .catch((error) => console.warn("[presence] record_login_failed", { userId, message: String(error) }));
}

/** Marca atividade a cada requisição autenticada, no máximo 1x por minuto por usuário. Nunca lança. */
export async function touchLastSeen(userId: string, lastSeenAt: Date | null) {
  if (lastSeenAt && Date.now() - lastSeenAt.getTime() < SEEN_WRITE_INTERVAL_MS) return;
  await prisma.user
    .update({ where: { id: userId }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);
}
