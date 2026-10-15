/**
 * Traduz mensagens do Supabase Auth (sempre em inglês) antes de mostrá-las ao usuário.
 * Mensagem desconhecida não vaza em inglês: cai no texto padrão em português.
 */
const RULES: { test: RegExp; message: (match: RegExpMatchArray) => string }[] = [
  {
    test: /only request this after (\d+) seconds?/i,
    message: (m) => `Por segurança, aguarde ${m[1]} segundos antes de tentar de novo.`,
  },
  {
    test: /rate limit|too many requests/i,
    message: () => "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
  },
  {
    test: /already (been )?registered|already exists|user already/i,
    message: () => "Já existe uma conta com este e-mail. Entre ou recupere a senha.",
  },
  {
    test: /password should be at least (\d+)/i,
    message: (m) => `A senha precisa ter pelo menos ${m[1]} caracteres.`,
  },
  {
    test: /new password should be different/i,
    message: () => "A nova senha precisa ser diferente da atual.",
  },
  {
    test: /weak password|password is known|pwned/i,
    message: () => "Essa senha é muito comum. Escolha outra.",
  },
  {
    test: /invalid login credentials/i,
    message: () => "E-mail ou senha incorretos.",
  },
  {
    test: /email not confirmed/i,
    message: () => "Confirme o e-mail antes de entrar. O link está na sua caixa de entrada.",
  },
  {
    test: /invalid format|email address .* is invalid|invalid email/i,
    message: () => "Informe um e-mail válido.",
  },
  {
    test: /expired|invalid.*token|token.*invalid|otp/i,
    message: () => "O link expirou ou já foi usado. Peça um novo.",
  },
  {
    test: /session (missing|not found)|not authenticated|jwt/i,
    message: () => "Sua sessão expirou. Entre de novo para continuar.",
  },
  {
    test: /fetch failed|network|timeout/i,
    message: () => "Não foi possível falar com o serviço de autenticação. Tente de novo.",
  },
];

export function authErrorMessage(raw: string | null | undefined, fallback: string): string {
  const message = String(raw || "").trim();
  if (!message) return fallback;
  for (const rule of RULES) {
    const match = message.match(rule.test);
    if (match) return rule.message(match);
  }
  return fallback;
}
