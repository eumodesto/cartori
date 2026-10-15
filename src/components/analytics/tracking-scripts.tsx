import Script from "next/script";
import { activeTrackingTags, type TrackingConfig } from "@/lib/tracking";

/** Google Tag Manager + gtag (GA4 / Google Ads) a partir de IDs já validados. */
export function TrackingScripts({ config }: { config: TrackingConfig }) {
  const { gtmId, gtagIds } = activeTrackingTags(config);
  if (!gtmId && gtagIds.length === 0) return null;

  return (
    <>
      {gtmId && (
        <>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
          </Script>
        </>
      )}

      {gtagIds.length > 0 && (
        <>
          <Script
            id="gtag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${gtagIds
              .map((id) => `gtag('config',${JSON.stringify(id)});`)
              .join("")}`}
          </Script>
        </>
      )}
    </>
  );
}
