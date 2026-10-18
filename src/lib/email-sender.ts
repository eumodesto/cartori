/** Remetente (From) do Resend: precisa ser de domínio verificado. Puro: servidor e tela. */

export const WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "bol.com.br",
  "uol.com.br",
  "terra.com.br",
]);

/** "Nome <e-mail>" ou "e-mail" → e-mail em minúsculas. */
export function senderAddress(from: string) {
  return (from.match(/<([^>]+)>\s*$/)?.[1] ?? from).trim().toLowerCase();
}

export function senderDomain(from: string) {
  return senderAddress(from).split("@")[1] ?? "";
}

/** Mensagem de problema no remetente, ou null se pode tentar enviar. */
export function senderProblem(from: string): string | null {
  if (!from.trim()) return "Remetente não configurado.";
  const domain = senderDomain(from);
  if (WEBMAIL_DOMAINS.has(domain)) {
    return `O remetente está como @${domain}, que o Resend não envia. Troque em Gestão → E-mails por um endereço do seu domínio verificado (ex.: InterJuri <nao-responda@interjuri.com.br>).`;
  }
  return null;
}
