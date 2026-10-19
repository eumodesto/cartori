import { waitUntil } from "@vercel/functions";

/**
 * Roda uma tarefa depois da resposta (e-mails, avisos), sem atrasar quem clicou.
 * Na Vercel, waitUntil mantém a função viva até a tarefa terminar; fora dela (localhost),
 * a promessa segue normalmente. Nunca lança: erro só vai para o log.
 */
export function runInBackground(label: string, task: Promise<unknown>) {
  const safe = task.catch((error) => console.error(`[background] ${label}_failed`, error));
  try {
    waitUntil(safe);
  } catch {
    void safe;
  }
}
