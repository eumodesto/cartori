import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartori - Plataforma Notarial & Emissão de Certidões",
  description: "SaaS de emissão de certidões em todo o Brasil para advogados, imobiliárias e cidadãos. Solicite múltiplas certidões em um único pedido.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
