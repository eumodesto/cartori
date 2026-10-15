import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AmandaChatDockProvider } from "@/components/cartori/ai-chat-widget";
import { CartProvider } from "@/components/cart/cart-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { TrackingScripts } from "@/components/analytics/tracking-scripts";
import { JsonLd } from "@/components/seo/json-ld";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { getTrackingConfig } from "@/lib/tracking-settings";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-32.png",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tracking = await getTrackingConfig();

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
        <TrackingScripts config={tracking} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
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
