"use client";

import { useEffect, useState } from "react";

function toImageSrc(base64?: string) {
  if (!base64) return "";
  const raw = base64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  return `data:image/png;base64,${raw}`;
}

export function PixQr({
  qrCode,
  qrCodeBase64,
}: {
  qrCode?: string;
  qrCodeBase64?: string;
}) {
  const [src, setSrc] = useState(toImageSrc(qrCodeBase64));

  useEffect(() => {
    const fromMp = toImageSrc(qrCodeBase64);
    if (fromMp) {
      setSrc(fromMp);
      return;
    }
    if (!qrCode || !qrCode.startsWith("000201")) {
      setSrc("");
      return;
    }

    let cancelled = false;
    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(qrCode, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 320,
        })
      )
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
    };
  }, [qrCode, qrCodeBase64]);

  if (!src) {
    return (
      <div className="w-56 h-56 mx-auto border border-dashed border-neutral-300 rounded-xl flex items-center justify-center text-center text-sm text-neutral-500 p-4">
        Gerando QR Code PIX...
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="QR Code PIX Mercado Pago"
      className="w-56 h-56 mx-auto border border-neutral-200 rounded-xl bg-white p-2"
    />
  );
}
