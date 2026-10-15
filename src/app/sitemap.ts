import type { MetadataRoute } from "next";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import { certificatePath } from "@/lib/certificate-links";
import { absoluteUrl } from "@/lib/seo";

const INSTITUTIONAL_PATHS = ["/suporte", "/termos", "/privacidade"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...MVP_CERTIFICATES.map((cert) => ({
      url: absoluteUrl(certificatePath(cert.slug)),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...INSTITUTIONAL_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
