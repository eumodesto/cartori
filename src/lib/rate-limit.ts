import type { NextRequest } from "next/server";

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "local";
}

/** Janela em memória por instância. Na Vercel cada processo conta o seu. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((stamp) => now - stamp < windowMs);
  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] || now;
    buckets.set(key, bucket);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    const first = buckets.keys().next().value;
    if (first) buckets.delete(first);
  }
  return { ok: true, retryAfterSec: 0 };
}
