"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WhisperPart {
  text: string;
  className?: string;
  newline?: boolean;
}

interface WhisperTextProps {
  text?: string;
  parts?: WhisperPart[];
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  triggerStart?: string;
}

export function WhisperText({
  text = "",
  parts,
  className = "",
  delay = 80,
  duration = 0.4,
  x = 0,
  y = 0,
  triggerStart = "top 90%",
}: WhisperTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const words = (parts ?? [{ text }]).flatMap((part) =>
    part.text
      .split(" ")
      .filter(Boolean)
      .map((word, wordIndex) => ({
        word,
        className: part.className,
        newline: Boolean(part.newline && wordIndex === 0),
      }))
  );
  const contentKey = words.map((item) => item.word).join(" ");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-word]");

      gsap.set(targets, { opacity: 0, x, y });

      gsap.to(targets, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: triggerStart,
          toggleActions: "play none none none",
          once: true,
        },
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        ease: "power2.out",
        stagger: delay / 1000,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [contentKey, delay, duration, x, y, triggerStart]);

  return (
    <span
      ref={containerRef}
      className={cn("relative flex flex-wrap w-full gap-x-2", className)}
      style={{ overflow: "visible" }}
    >
      {words.map((item, i) => (
        <React.Fragment key={`${item.word}-${i}`}>
          {item.newline ? (
            <span className="basis-full h-0 w-full" aria-hidden />
          ) : null}
          <span
            data-word
            className={cn("inline-block whitespace-nowrap opacity-0", item.className)}
            style={{ position: "relative" }}
          >
            {item.word}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}

export default WhisperText;
