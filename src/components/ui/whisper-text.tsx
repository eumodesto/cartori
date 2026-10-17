import React from "react";
import { cn } from "@/lib/utils";

interface WhisperPart {
  text: string;
  className?: string;
  newline?: boolean;
}

interface WhisperTextProps {
  text?: string;
  parts?: WhisperPart[];
  className?: string;
  /** Intervalo entre palavras, em ms. */
  delay?: number;
  /** Duração de cada palavra, em segundos. */
  duration?: number;
  x?: number;
  y?: number;
}

/**
 * Entrada palavra a palavra só com CSS (sem JS): o texto já é pintado no primeiro quadro
 * (nunca começa invisível), então não atrasa o LCP. Respeita "reduzir movimento".
 */
export function WhisperText({
  text = "",
  parts,
  className = "",
  delay = 80,
  duration = 0.4,
  x = 0,
  y = 0,
}: WhisperTextProps) {
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

  return (
    <span className={cn("relative flex flex-wrap w-full gap-x-2", className)} style={{ overflow: "visible" }}>
      {words.map((item, i) => (
        <React.Fragment key={`${item.word}-${i}`}>
          {item.newline ? <span className="basis-full h-0 w-full" aria-hidden /> : null}
          <span
            className={cn("whisper-word inline-block whitespace-nowrap", item.className)}
            style={
              {
                position: "relative",
                "--whisper-x": `${x}px`,
                "--whisper-y": `${y}px`,
                animationDelay: `${i * delay}ms`,
                animationDuration: `${duration}s`,
              } as React.CSSProperties
            }
          >
            {item.word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}

export default WhisperText;
