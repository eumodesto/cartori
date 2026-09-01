"use client";

import * as React from "react";
import { Send, X, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AmandaProductLink } from "@/lib/amanda-products";
import {
  extractAmandaProducts,
  splitAmandaReply,
  amandaTypingDelay,
} from "@/lib/amanda-products";
import {
  type AmandaChatMessage,
  readAmandaHistory,
  writeAmandaHistory,
  clearAmandaHistory,
} from "@/lib/amanda-history";

type ChatMessage = AmandaChatMessage;

const SUGGESTIONS = [
  "Quanto custa a certidão de nascimento?",
  "Qual o prazo da CENSEC?",
  "O que é matrícula de imóvel?",
];

export function AmandaChat({
  className,
  onSelectProduct,
  onClose,
  showHeader = true,
}: {
  className?: string;
  onSelectProduct?: (slug: string) => void;
  onClose?: () => void;
  showHeader?: boolean;
}) {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const transcriptRef = React.useRef<HTMLDivElement>(null);
  const runIdRef = React.useRef(0);

  React.useEffect(() => {
    setMessages(readAmandaHistory());
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hasHydrated) return;
    writeAmandaHistory(messages);
  }, [hasHydrated, messages]);

  React.useEffect(() => {
    if (!hasHydrated) return;
    const transcript = transcriptRef.current;
    if (!transcript) return;
    transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
  }, [hasHydrated, messages, isTyping]);

  const historyForApi = (items: ChatMessage[]) => {
    const turns: { role: "user" | "assistant"; content: string }[] = [];

    for (const item of items) {
      if (item.role === "user") {
        turns.push({ role: "user", content: item.content });
        continue;
      }

      if (!item.content.trim()) continue;

      const last = turns[turns.length - 1];
      if (last?.role === "assistant") {
        last.content = `${last.content}\n\n${item.content}`;
      } else {
        turns.push({ role: "assistant", content: item.content });
      }
    }

    return turns;
  };

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const deliverInBlocks = async (
    text: string,
    products: AmandaProductLink[],
    runId: number
  ) => {
    const blocks = splitAmandaReply(text);
    if (blocks.length === 0 && text.trim()) blocks.push(text.trim());
    const instant = prefersReducedMotion();

    for (const block of blocks) {
      if (runIdRef.current !== runId) return;
      setIsTyping(true);
      if (!instant) {
        await new Promise((resolve) => setTimeout(resolve, amandaTypingDelay(block)));
      }
      if (runIdRef.current !== runId) return;
      setMessages((prev) => [...prev, { role: "assistant", content: block }]);
    }

    if (products.length > 0) {
      if (runIdRef.current !== runId) return;
      setIsTyping(true);
      if (!instant) {
        await new Promise((resolve) => setTimeout(resolve, 520));
      }
      if (runIdRef.current !== runId) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Se quiser seguir, solicite por aqui:",
          products,
        },
      ]);
    }

    if (runIdRef.current === runId) setIsTyping(false);
  };

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isTyping || !hasHydrated) return;

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setIsTyping(true);

    try {
      const response = await fetch("/api/amanda/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi(nextHistory),
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Não foi possível responder agora.");
      }

      const parsed =
        Array.isArray(payload.products) && payload.products.length > 0
          ? { text: payload.reply as string, products: payload.products as AmandaProductLink[] }
          : extractAmandaProducts(payload.reply as string, text);

      await deliverInBlocks(parsed.text, parsed.products, runId);
    } catch (err) {
      if (runIdRef.current !== runId) return;
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao falar com a Amanda. Tente novamente.";
      setError(message);
      setIsTyping(false);
    }
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    void sendMessage(input);
  };

  return (
    <div
      className={cn(
        "w-full h-full min-h-0 flex flex-col overflow-hidden text-left",
        "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl",
        className
      )}
    >
      {showHeader ? (
      <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/amanda.png"
            alt="Amanda, assistente Cartori"
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-amber-400/70 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Amanda</p>
            <p className="text-[11px] text-amber-200/90 truncate">
              Especialista em Certidões
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onClose) {
              onClose();
              return;
            }
            runIdRef.current += 1;
            clearAmandaHistory();
            setMessages([]);
            setError(null);
            setIsTyping(false);
          }}
          className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={onClose ? "Fechar chat" : "Limpar conversa"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      ) : null}

      <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-3">
        {hasHydrated && messages.length === 0 ? (
          <div className="flex flex-col justify-center h-full gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/amanda.png"
                alt="Amanda"
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-amber-400/70"
              />
              <div>
                <h3 className="text-white text-base font-semibold mb-1 font-serif">
                  Olá, eu sou a Amanda.
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pergunte sobre o serviço que você precisa. Eu respondo a sua dúvida e te direciono ao pedido certo.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  className="text-left text-xs text-slate-100 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-3 py-2 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <img
                    src="/amanda.png"
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/20"
                  />
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-amber-500 text-primary-950 rounded-2xl rounded-tr-md font-medium whitespace-pre-wrap"
                      : "bg-white/10 text-slate-100 rounded-2xl rounded-tl-md border border-white/10"
                  )}
                >
                  {msg.content ? <p className="whitespace-pre-wrap">{msg.content}</p> : null}
                  {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                    <div className={cn("flex flex-col gap-1.5", msg.content && "mt-3")}>
                      {msg.products.map((product) => (
                        <button
                          key={product.slug}
                          type="button"
                          onClick={() => onSelectProduct?.(product.slug)}
                          className="group w-full flex items-center justify-between gap-2 text-left bg-amber-400 hover:bg-amber-300 text-primary-950 rounded-lg px-3 py-2 transition-colors"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-bold leading-tight truncate">
                              {product.name}
                            </span>
                            <span className="block text-[10px] font-medium text-primary-900/70">
                              {product.priceLabel} · {product.estimatedDays}
                            </span>
                          </span>
                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-extrabold">
                            Solicitar
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <img
                  src="/amanda.png"
                  alt=""
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/20"
                />
                <div className="px-3 py-2.5 rounded-2xl rounded-tl-md bg-white/10 border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <p className="text-[11px] text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "p-3 border-t shrink-0 transition-colors duration-fast pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          isFocused ? "border-amber-400/50 bg-white/10" : "border-white/15 bg-black/10"
        )}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Pergunte à Amanda..."
            maxLength={2000}
            disabled={isTyping}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-3.5 pr-12 text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
          />
          <button
            type="submit"
            disabled={input.trim() === "" || isTyping}
            aria-label="Enviar mensagem"
            className={cn(
              "absolute right-1.5 rounded-lg p-2 transition-colors",
              input.trim() === "" || isTyping
                ? "text-slate-500 cursor-not-allowed"
                : "text-primary-950 bg-amber-400 hover:bg-amber-300"
            )}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
