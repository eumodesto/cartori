"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AssistantAvatar } from "@/components/cartori/assistant-avatar";
import {
  type LauncherPosition,
  clampLauncherPosition,
  writeLauncherPosition,
} from "@/lib/chat-widget-config";

const DRAG_THRESHOLD = 12;

export function ChatLauncher({
  onOpen,
  position,
  onPositionChange,
  className,
}: {
  onOpen: () => void;
  position: LauncherPosition | null;
  onPositionChange: (position: LauncherPosition) => void;
  className?: string;
}) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const skipClickRef = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);

  const persist = React.useCallback(
    (next: LauncherPosition) => {
      const node = buttonRef.current;
      const width = node?.offsetWidth ?? 231;
      const height = node?.offsetHeight ?? 82;
      const clamped = clampLauncherPosition(next.x, next.y, width, height);
      onPositionChange(clamped);
      writeLauncherPosition(clamped);
    },
    [onPositionChange]
  );

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const node = buttonRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    const node = buttonRef.current;
    if (!drag.moved && node && !node.hasPointerCapture(event.pointerId)) {
      node.setPointerCapture(event.pointerId);
    }

    drag.moved = true;
    if (!dragging) setDragging(true);
    persist({ x: drag.originX + dx, y: drag.originY + dy });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const moved = drag.moved;
    dragRef.current = null;
    setDragging(false);

    if (buttonRef.current?.hasPointerCapture(event.pointerId)) {
      buttonRef.current.releasePointerCapture(event.pointerId);
    }

    skipClickRef.current = true;
    if (!moved) onOpen();
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (skipClickRef.current) {
      event.preventDefault();
      skipClickRef.current = false;
      return;
    }
    onOpen();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const node = buttonRef.current;
    if (!node) return;

    const step = event.shiftKey ? 24 : 8;
    const rect = node.getBoundingClientRect();
    let x = position?.x ?? rect.left;
    let y = position?.y ?? rect.top;

    if (event.key === "ArrowLeft") x -= step;
    else if (event.key === "ArrowRight") x += step;
    else if (event.key === "ArrowUp") y -= step;
    else if (event.key === "ArrowDown") y += step;
    else return;

    event.preventDefault();
    persist({ x, y });
  };

  React.useEffect(() => {
    const node = buttonRef.current;
    if (!node || !position) return;

    const onResize = () => {
      persist({ x: position.x, y: position.y });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position, persist]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label="Abrir conversa com Amanda, Especialista em Certidões. Arraste para reposicionar."
      className={cn(
        "fixed z-40 flex items-center gap-3 rounded-2xl pr-4 pl-1.5 py-1.5",
        !position && "right-3 bottom-3 md:right-6 md:bottom-6",
        "bg-brand-950/95 text-left text-neutral-0 shadow-md",
        "border border-white/15 backdrop-blur-md",
        dragging ? "cursor-grabbing" : "cursor-grab",
        "select-none touch-none",
        "transition-colors duration-normal",
        "hover:border-amber-400/40 hover:bg-brand-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950",
        className
      )}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      <span className="relative shrink-0">
        <AssistantAvatar size={68} animated className="pointer-events-none w-[68px] h-[68px] border border-amber-400/50" />
        <span
          className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-semantic-success border-2 border-brand-950"
          aria-hidden
        />
      </span>
      <span className="min-w-0 pr-1">
        <span className="block text-sm font-semibold leading-tight">Amanda</span>
        <span className="block text-[11px] text-amber-200/90 leading-tight mt-0.5">
          Especialista em Certidões
        </span>
      </span>
    </button>
  );
}
