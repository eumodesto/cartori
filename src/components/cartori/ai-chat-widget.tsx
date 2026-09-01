"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AmandaChat } from "@/components/cartori/amanda-chat";
import { ChatLauncher } from "@/components/cartori/chat-launcher";
import { ChatPanel } from "@/components/cartori/chat-panel";
import {
  type ChatWidgetPhase,
  type LauncherPosition,
  isChatWidgetEnabled,
  readLauncherPosition,
} from "@/lib/chat-widget-config";

type ProductHandler = (slug: string) => void;

type DockContextValue = {
  registerHeroSlot: (node: HTMLDivElement | null) => void;
  registerProductHandler: (handler: ProductHandler | null) => void;
};

const DockContext = React.createContext<DockContextValue | null>(null);

export function useAmandaChatDock() {
  const ctx = React.useContext(DockContext);
  if (!ctx) {
    throw new Error("useAmandaChatDock deve ser usado dentro de AmandaChatDockProvider.");
  }
  return ctx;
}

export function AmandaHeroSlot({ className }: { className?: string }) {
  const { registerHeroSlot } = useAmandaChatDock();
  return <div ref={registerHeroSlot} id="amanda-chat" className={className} />;
}

export function AmandaChatDockProvider({ children }: { children: React.ReactNode }) {
  const [heroEl, setHeroEl] = React.useState<HTMLDivElement | null>(null);
  const productHandlerRef = React.useRef<ProductHandler | null>(null);

  const registerHeroSlot = React.useCallback((node: HTMLDivElement | null) => {
    setHeroEl(node);
  }, []);

  const registerProductHandler = React.useCallback((handler: ProductHandler | null) => {
    productHandlerRef.current = handler;
  }, []);

  const value = React.useMemo(
    () => ({ registerHeroSlot, registerProductHandler }),
    [registerHeroSlot, registerProductHandler]
  );

  return (
    <DockContext.Provider value={value}>
      {children}
      <AIChatWidget heroEl={heroEl} productHandlerRef={productHandlerRef} />
    </DockContext.Provider>
  );
}

function AIChatWidget({
  heroEl,
  productHandlerRef,
}: {
  heroEl: HTMLDivElement | null;
  productHandlerRef: React.MutableRefObject<ProductHandler | null>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const enabled = isChatWidgetEnabled(pathname);
  const [phase, setPhase] = React.useState<ChatWidgetPhase>("closed");
  const [heroInView, setHeroInView] = React.useState(false);
  const [parkEl, setParkEl] = React.useState<HTMLDivElement | null>(null);
  const [panelEl, setPanelEl] = React.useState<HTMLDivElement | null>(null);
  const [hostEl, setHostEl] = React.useState<HTMLDivElement | null>(null);
  const [launcherPos, setLauncherPos] = React.useState<LauncherPosition | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setLauncherPos(readLauncherPosition());
  }, []);

  React.useEffect(() => {
    const el = document.createElement("div");
    el.className = "h-full w-full min-h-0 flex flex-col";
    el.setAttribute("data-amanda-host", "");
    setHostEl(el);
    return () => {
      el.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!heroEl) {
      setHeroInView(false);
      return;
    }

    setHeroInView(true);

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px" }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [heroEl]);

  const floating = phase === "opening" || phase === "open" || phase === "closing";

  React.useLayoutEffect(() => {
    if (!hostEl) return;

    const parent =
      enabled && heroInView && !floating && heroEl
        ? heroEl
        : enabled && floating && panelEl
          ? panelEl
          : parkEl;

    if (parent && hostEl.parentElement !== parent) {
      parent.appendChild(hostEl);
    }
  }, [hostEl, enabled, heroInView, floating, heroEl, panelEl, parkEl]);

  React.useEffect(() => {
    if (heroInView && floating && phase === "open") {
      setPhase("closed");
    }
  }, [heroInView, floating, phase]);

  const closePanel = React.useCallback(() => {
    setPhase("closing");
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setPhase("closed");
      closeTimerRef.current = null;
    }, 220);
  }, []);

  const openPanel = React.useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPhase("opening");
    requestAnimationFrame(() => setPhase("open"));
  }, []);

  React.useEffect(() => {
    if (phase !== "open" && phase !== "opening") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, closePanel]);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleSelectProduct = React.useCallback(
    (slug: string) => {
      if (productHandlerRef.current) {
        productHandlerRef.current(slug);
        return;
      }
      router.push("/#certidoes");
    },
    [productHandlerRef, router]
  );

  const showLauncher = enabled && !heroInView && phase === "closed";

  if (!enabled) return null;

  return (
    <>
      <div ref={setParkEl} hidden />
      {showLauncher ? (
        <ChatLauncher
          onOpen={openPanel}
          position={launcherPos}
          onPositionChange={(next) => {
            setLauncherPos((prev) =>
              prev && prev.x === next.x && prev.y === next.y ? prev : next
            );
          }}
        />
      ) : null}
      <ChatPanel
        phase={phase}
        onClose={closePanel}
        bodyRef={setPanelEl}
        anchor={launcherPos}
      />
      {hostEl
        ? createPortal(
            <AmandaChat
              className="h-full min-h-0 rounded-none border-0 shadow-none bg-transparent backdrop-blur-none"
              showHeader={!floating}
              onClose={floating ? closePanel : undefined}
              onSelectProduct={handleSelectProduct}
            />,
            hostEl
          )
        : null}
    </>
  );
}
