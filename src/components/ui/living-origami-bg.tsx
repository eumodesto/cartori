"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import styles from "./living-origami-bg.module.css";

type BirdConfig = {
  duration: number;
  delay: number;
  scale: number;
  yStart: number;
  yEnd: number;
  rStart: number;
  rEnd: number;
  flapDelay: number;
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(value: string) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 1);
}

function buildFlock(count: number, seed: number): BirdConfig[] {
  const rand = mulberry32(seed);
  const between = (min: number, max: number) => rand() * (max - min) + min;

  return Array.from({ length: count }, () => ({
    duration: between(18, 36),
    delay: between(-36, 0),
    scale: between(0.22, 0.72),
    yStart: between(-38, 38),
    yEnd: between(-38, 38),
    rStart: between(-28, 28),
    rEnd: between(-28, 28),
    flapDelay: between(-4, 0),
  }));
}

export function LivingOrigamiBg({
  className,
  birdCount = 7,
  seed = "cartori",
}: {
  className?: string;
  birdCount?: number;
  seed?: string;
}) {
  const flock = useMemo(
    () => buildFlock(birdCount, seedFromString(seed)),
    [birdCount, seed]
  );

  return (
    <div className={cn(styles.stage, className)} aria-hidden>
      {flock.map((bird, index) => (
        <div
          key={index}
          className={styles.drifter}
          style={
            {
              "--y-start": `${bird.yStart}%`,
              "--y-end": `${bird.yEnd}%`,
              "--r-start": `${bird.rStart}deg`,
              "--r-end": `${bird.rEnd}deg`,
              animationDuration: `${bird.duration}s`,
              animationDelay: `${bird.delay}s`,
            } as React.CSSProperties
          }
        >
          <div style={{ transform: `scale(${bird.scale})` }}>
            <div
              className={styles.crane}
              style={{
                animationDelay: `${bird.flapDelay}s`,
              }}
            >
              <div className={`${styles.part} ${styles.body}`} />
              <div className={`${styles.part} ${styles.wingLeft}`} />
              <div className={`${styles.part} ${styles.wingRight}`} />
              <div className={`${styles.part} ${styles.tail}`} />
            </div>
          </div>
        </div>
      ))}
      <div className={styles.veil} />
    </div>
  );
}

export default LivingOrigamiBg;
