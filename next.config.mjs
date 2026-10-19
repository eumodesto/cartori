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
    // Medição de conversões do Google Ads (ccm/s/collect).
    "https://ad.doubleclick.net",
    "https://*.google.com",
    "https://www.google.com.br",
    "https://pagead2.googlesyndication.com",
    "https://www.googleadservices.com",
  ].join(" "),
  frame: ["https://www.googletagmanager.com", "https://td.doubleclick.net"].join(" "),
};

// Mercado Pago (Card Payment Brick): o SDK baixa scripts, estilos e fontes de mlstatic,
// abre os campos seguros do cartão em iframes e consulta APIs do Mercado Pago/Livre.
// Sem isto o formulário do cartão não aparece (bloqueado pela CSP).
const mercadoPago = [
  "https://sdk.mercadopago.com",
  "https://*.mercadopago.com",
  "https://*.mercadopago.com.br",
  "https://*.mercadolibre.com",
  "https://*.mercadolivre.com",
  "https://*.mercadolivre.com.br",
  "https://http2.mlstatic.com",
  "https://*.mlstatic.com",
].join(" ");

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
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${mercadoPago} ${googleTags.script}`,
          `style-src 'self' 'unsafe-inline' ${mercadoPago}`,
          "img-src 'self' data: blob: https:",
          `font-src 'self' data: ${mercadoPago}`,
          `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${mercadoPago} ${googleTags.connect}`,
          `frame-src ${mercadoPago} ${googleTags.frame}`,
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
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    const privateSections = [
      "painel",
      "admin",
      "operacao",
      "checkout",
      "carrinho",
      "pedido",
      "pos-login",
      "design-system",
    ];
    return [
      { source: "/:path*", headers },
      ...privateSections.map((section) => ({ source: `/${section}/:path*`, headers: noindex })),
      // Arquivos de public/ sem hash no nome: fontes mudam raramente (1 ano); logos e imagens
      // ficam 30 dias no cache, revalidando em segundo plano para uma troca de arquivo aparecer.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/:file((?!_next/).*\\.(?:png|webp|svg|ico|jpg|jpeg|avif))",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
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
      // Certidões retiradas da venda (Registro Civil e as gratuitas nos órgãos oficiais).
      {
        source:
          "/certidao/:slug(certidao-de-nascimento|certidao-de-casamento|certidao-de-obito|certidao-de-divorcio|certidao-de-interdicao|trf-certidao-de-distribuicao-da-justica-federal|trt-certidao-de-acoes-trabalhistas-ceat|pesquisa-de-protesto|ccir-certificado-cadastro-imovel-rural-incra|nascimento|casamento|obito|divorcio|interdicao)",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
