import type { Metadata } from "next";
import { purchaseConversionTarget } from "@/lib/tracking";
import { getTrackingConfig } from "@/lib/tracking-settings";
import { ConfirmadoView } from "./confirmado-view";

export const metadata: Metadata = {
  title: "Pagamento confirmado | InterJuri",
  robots: { index: false, follow: false },
};

export default async function ConfirmadoPage() {
  const adsSendTo = purchaseConversionTarget(await getTrackingConfig());
  return <ConfirmadoView adsSendTo={adsSendTo} />;
}
