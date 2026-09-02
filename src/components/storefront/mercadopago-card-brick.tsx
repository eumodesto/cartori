"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

type CardFormData = {
  token: string;
  issuer_id?: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer?: {
    email?: string;
    identification?: { type: string; number: string };
  };
};

type BrickController = {
  unmount: () => void;
  update?: (data: { amount: number }) => boolean | Promise<boolean>;
};

type MercadoPagoCtor = new (
  publicKey: string,
  options?: { locale?: string }
) => {
  bricks: () => {
    create: (
      brick: string,
      target: string,
      settings: unknown
    ) => Promise<BrickController>;
  };
};

declare global {
  interface Window {
    MercadoPago?: MercadoPagoCtor;
  }
}

const MP_SCRIPT = "https://sdk.mercadopago.com/js/v2";

export function MercadoPagoCardBrick({
  amount,
  onPay,
  onError,
}: {
  amount: number;
  onPay: (formData: CardFormData) => Promise<void>;
  onError?: (message: string) => void;
}) {
  const reactId = useId().replace(/:/g, "");
  const containerId = `cardPaymentBrick_${reactId}`;
  const controllerRef = useRef<BrickController | null>(null);
  const renderingRef = useRef(false);
  const onPayRef = useRef(onPay);
  const onErrorRef = useRef(onError);
  onPayRef.current = onPay;
  onErrorRef.current = onError;

  const publicKey = (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "").trim();

  const renderBrick = async () => {
    if (!publicKey || !window.MercadoPago || amount <= 0 || renderingRef.current) {
      return;
    }
    renderingRef.current = true;
    try {
      controllerRef.current?.unmount();
      controllerRef.current = null;
      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      controllerRef.current = await mp.bricks().create("cardPayment", containerId, {
        locale: "pt-BR",
        initialization: { amount: Number(amount.toFixed(2)) },
        customization: {
          paymentMethods: {
            maxInstallments: 12,
            types: { included: ["credit_card", "debit_card"] },
          },
          visual: {
            hideFormTitle: true,
            style: {
              theme: "default",
              customVariables: {
                baseColor: "#011E37",
                formBackgroundColor: "transparent",
                baseColorFirstVariant: "#062943",
              },
            },
          },
        },
        callbacks: {
          onReady: () => undefined,
          onError: (error: { message?: string }) => {
            onErrorRef.current?.(
              error?.message || "Não foi possível carregar o pagamento com cartão."
            );
          },
          onSubmit: (formData: CardFormData) =>
            onPayRef.current(formData).catch((error: unknown) => {
              const message =
                error instanceof Error
                  ? error.message
                  : "Não foi possível processar o cartão.";
              onErrorRef.current?.(message);
              throw error;
            }),
        },
      });
    } catch (error) {
      onErrorRef.current?.(
        error instanceof Error
          ? error.message
          : "Falha ao iniciar o checkout transparente do Mercado Pago."
      );
    } finally {
      renderingRef.current = false;
    }
  };

  useEffect(() => {
    if (!window.MercadoPago) return undefined;
    void renderBrick();
    return () => {
      controllerRef.current?.unmount();
      controllerRef.current = null;
    };
    // Recreate when the container or public key changes; amount is updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, publicKey]);

  useEffect(() => {
    if (!controllerRef.current?.update || amount <= 0) return;
    void controllerRef.current.update({ amount: Number(amount.toFixed(2)) });
  }, [amount]);

  if (!publicKey) {
    return (
      <p className="text-sm text-semantic-error">
        Checkout transparente indisponível. Defina NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script src={MP_SCRIPT} strategy="afterInteractive" onLoad={() => void renderBrick()} />
      <div id={containerId} />
    </div>
  );
}
