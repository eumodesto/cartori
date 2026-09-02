import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AmandaChatDockProvider } from "@/components/cartori/ai-chat-widget";
import { CartProvider } from "@/components/cart/cart-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartori - Plataforma Notarial & Emissão de Certidões",
  description: "SaaS de emissão de certidões em todo o Brasil para advogados, imobiliárias e cidadãos. Solicite múltiplas certidões em um único pedido.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/mori/PPMori-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/mori/PPMori-Semibold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/editorial-sans/PPEditorialSans-Ultrabold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-page text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-950">
        <ThemeProvider defaultTheme="light" storageKey="cartori-theme">
          <AuthProvider>
            <CartProvider>
              <AmandaChatDockProvider>
                {children}
              </AmandaChatDockProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
