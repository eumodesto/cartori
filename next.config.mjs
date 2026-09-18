/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
