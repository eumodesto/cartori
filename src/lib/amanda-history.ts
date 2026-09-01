import type { AmandaProductLink } from "@/lib/amanda-products";

export type AmandaChatMessage = {
  role: "user" | "assistant";
  content: string;
  products?: AmandaProductLink[];
};

const COOKIE_NAME = "cartori_amanda_chat";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MAX_ENCODED_BYTES = 3500;
const MAX_MESSAGES = 30;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function isProduct(value: unknown): value is AmandaProductLink {
  if (!value || typeof value !== "object") return false;
  const item = value as AmandaProductLink;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.priceLabel === "string" &&
    typeof item.estimatedDays === "string"
  );
}

function isMessage(value: unknown): value is AmandaChatMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as AmandaChatMessage;
  if (item.role !== "user" && item.role !== "assistant") return false;
  if (typeof item.content !== "string") return false;
  if (item.products !== undefined && !Array.isArray(item.products)) return false;
  if (item.products && !item.products.every(isProduct)) return false;
  return true;
}

export function readAmandaHistory(): AmandaChatMessage[] {
  try {
    const raw = readCookie(COOKIE_NAME);
    if (!raw) return [];
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMessage).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
      products: item.products,
    }));
  } catch {
    return [];
  }
}

export function writeAmandaHistory(messages: AmandaChatMessage[]): void {
  if (typeof document === "undefined") return;

  let trimmed = messages.slice(-MAX_MESSAGES);
  let encoded = encodeURIComponent(JSON.stringify(trimmed));

  while (encoded.length > MAX_ENCODED_BYTES && trimmed.length > 1) {
    trimmed = trimmed.slice(1);
    encoded = encodeURIComponent(JSON.stringify(trimmed));
  }

  if (trimmed.length === 0) {
    clearAmandaHistory();
    return;
  }

  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearAmandaHistory(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
