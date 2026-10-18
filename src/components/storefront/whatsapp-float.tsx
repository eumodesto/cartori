"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { isChatWidgetEnabled } from "@/lib/chat-widget-config";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/support-contacts";
import { cn } from "@/lib/utils";

/**
 * Botão flutuante do WhatsApp, no canto inferior direito do site de vendas.
 * Quando o chat da Amanda aparece no mesmo canto (cliente logado), o botão sobe para não cobri-lo.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const { profile, loading } = useAuth();
  const chatBelow = isChatWidgetEnabled(pathname || "/", { platformRole: profile?.role, authLoading: loading });

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar no WhatsApp: ${WHATSAPP_DISPLAY}`}
      title={`WhatsApp ${WHATSAPP_DISPLAY}`}
      className={cn(
        "group fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg",
        "transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        "md:right-6",
        chatBelow ? "bottom-28 md:bottom-32" : "bottom-4 md:bottom-6"
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-md group-hover:block md:group-focus-visible:block">
        Fale no WhatsApp
      </span>
    </a>
  );
}
