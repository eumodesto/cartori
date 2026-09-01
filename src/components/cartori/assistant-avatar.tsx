"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ASSISTANT_ASSETS } from "@/lib/chat-widget-config";

export function AssistantAvatar({
  size = 68,
  animated = true,
  className,
  alt = "Amanda, assistente Cartori",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  alt?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(ASSISTANT_ASSETS.fallback);
  const showVideo = animated && !reducedMotion && !videoFailed;

  const frameClass = cn(
    "rounded-full object-cover shrink-0 bg-brand-900",
    className
  );

  if (showVideo) {
    return (
      <video
        className={frameClass}
        width={size}
        height={size}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={ASSISTANT_ASSETS.fallback}
        onError={() => setVideoFailed(true)}
        aria-label={alt}
      >
        <source src={ASSISTANT_ASSETS.webm} type="video/webm" />
        <source src={ASSISTANT_ASSETS.mp4} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      className={frameClass}
      onError={() => {
        if (imageSrc !== ASSISTANT_ASSETS.fallback) {
          setImageSrc(ASSISTANT_ASSETS.fallback);
        }
      }}
    />
  );
}
