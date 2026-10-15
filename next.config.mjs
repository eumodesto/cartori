// Domínios do Google Tag Manager, Analytics 4 e Ads (configurados em /admin/configuracoes).
// Tags de terceiros publicadas dentro do GTM precisam ter o domínio incluído aqui.
const googleTags = {
  script: [
    "https://*.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
    "https://www.google.com",
  ].join(" "),
  connect: [
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.g.doubleclick.net",
    "https://*.google.com",
    "https://www.google.com.br",
    "https://pagead2.googlesyndication.com",
    "https://www.googleadservices.com",
  ].join(" "),
  frame: ["https://www.googletagmanager.com", "https://td.doubleclick.net"].join(" "),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com ${googleTags.script}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://sdk.mercadopago.com ${googleTags.connect}`,
          `frame-src https://www.mercadopago.com https://www.mercadopago.com.br https://sdk.mercadopago.com ${googleTags.frame}`,
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
        ].join("; "),
      },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers }];
  },
  async redirects() {
    // Rotas antigas /dashboard/* → nova arquitetura por seção (/painel, /operacao, /admin).
    // Renomeadas primeiro; catch-all por último. Todos 308 (permanente).
    return [
      { source: "/dashboard/solicitacoes/:path*", destination: "/painel/pedidos/:path*", permanent: true },
      { source: "/dashboard/solicitacoes", destination: "/painel/pedidos", permanent: true },
      { source: "/dashboard/organizacao/:path*", destination: "/painel/empresa/:path*", permanent: true },
      { source: "/dashboard/organizacao", destination: "/painel/empresa", permanent: true },
      { source: "/dashboard/operacao/:path*", destination: "/operacao/pedidos/:path*", permanent: true },
      { source: "/dashboard/operacao", destination: "/operacao/pedidos", permanent: true },
      { source: "/dashboard/usuarios/:path*", destination: "/admin/usuarios/:path*", permanent: true },
      { source: "/dashboard/usuarios", destination: "/admin/usuarios", permanent: true },
      { source: "/dashboard/emails/:path*", destination: "/admin/emails/:path*", permanent: true },
      { source: "/dashboard/emails", destination: "/admin/emails", permanent: true },
      { source: "/dashboard/:path*", destination: "/painel/:path*", permanent: true },
      { source: "/dashboard", destination: "/painel", permanent: true },
    ];
  },
};

export default nextConfig;
