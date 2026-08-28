import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartori - Plataforma Notarial & Emissão de Certidões",
  description: "SaaS de emissão de certidões em todo o Brasil para advogados, imobiliárias e cidadãos. Solicite múltiplas certidões em um único pedido.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-surface-page text-neutral-900 selection:bg-brand-100 selection:text-brand-950">
        <ThemeProvider defaultTheme="light" storageKey="cartori-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
