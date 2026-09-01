"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantAvatar } from "@/components/cartori/assistant-avatar";
import type { ChatWidgetPhase, LauncherPosition } from "@/lib/chat-widget-config";

export function ChatPanel({
  phase,
  onClose,
  bodyRef,
  children,
  anchor,
}: {
  phase: ChatWidgetPhase;
  onClose: () => void;
  bodyRef: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
  anchor: LauncherPosition | null;
}) {
  const reducedMotion = useReducedMotion();
  const visible = phase === "open" || phase === "opening";
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>();

  React.useLayoutEffect(() => {
    if (!anchor || typeof window === "undefined") {
      setPanelStyle(undefined);
      return;
    }

    const isDesktop = window.innerWidth >= 768;
    const margin = isDesktop ? 24 : 12;
    const width = isDesktop ? 420 : window.innerWidth - 24;
    const height = isDesktop
      ? Math.min(680, window.innerHeight - 48)
      : Math.min(window.innerHeight * 0.78, window.innerHeight - 24);

    let left = anchor.x + 231 - width;
    let top = anchor.y - 8 - height;

    if (top < margin) top = anchor.y + 90;
    if (top + height > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - margin - height);
    }
    if (left < margin) left = margin;
    if (left + width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - margin - width);
    }

    setPanelStyle({ left, top, right: "auto", bottom: "auto", width, height });
  }, [anchor, visible]);

  return (
    <motion.div
      role="dialog"
      aria-label="Chat com Amanda"
      aria-modal={visible}
      aria-hidden={phase === "closed"}
      initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 12, scale: 0.98 }
      }
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed z-40 flex flex-col overflow-hidden",
        "right-3 bottom-3 w-[calc(100vw-24px)] h-[78dvh] max-h-[78dvh]",
        "md:right-6 md:bottom-6 md:left-auto md:w-[420px] md:h-[min(680px,calc(100dvh-48px))] md:max-h-[calc(100dvh-48px)]",
        "rounded-2xl border border-white/15 bg-brand-950 shadow-md",
        "pb-[env(safe-area-inset-bottom)]",
        phase === "closed" && "hidden"
      )}
      style={panelStyle}
    >
      <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative shrink-0">
            <AssistantAvatar
              size={36}
              animated={false}
              className="w-9 h-9 border border-amber-400/70"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-semantic-success border-2 border-brand-950"
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-0 leading-tight">Amanda</p>
            <p className="text-[11px] text-amber-200/90 truncate">Especialista em Certidões</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Fechar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={bodyRef} className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
