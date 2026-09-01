"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

interface SlideUpTextProps {
  children: React.ReactNode;
  split?: "words" | "characters" | "lines";
  delay?: number;
  stagger?: number;
  from?: "first" | "last" | "center";
  transition?: Transition;
  className?: string;
  wordClass?: string;
  charClass?: string;
  autoStart?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  inView?: boolean;
  once?: boolean;
}

export interface SlideUpTextRef {
  startAnimation: () => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

function splitIntoCharacters(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("pt-BR", { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

const SlideUpText = forwardRef<SlideUpTextRef, SlideUpTextProps>(
  (
    {
      children,
      split = "words",
      delay = 0,
      stagger = 0.1,
      from = "first",
      transition = {
        type: "tween",
        ease: [0.625, 0.05, 0, 1],
        duration: 0.5,
      },
      className,
      wordClass,
      charClass,
      autoStart = true,
      onStart,
      onComplete,
      inView = false,
      once = true,
    },
    ref
  ) => {
    const text = typeof children === "string" ? children : String(children ?? "");
    const [isAnimating, setIsAnimating] = useState(false);

    const elements = useMemo(() => {
      if (split === "characters") {
        const words = text.split(" ");
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      return split === "words" ? text.split(" ") : text.split("\n");
    }, [text, split]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          split === "characters"
            ? (elements as WordObject[]).reduce(
                (acc, word) => acc + word.characters.length + (word.needsSpace ? 1 : 0),
                0
              )
            : elements.length;

        if (from === "last") return (total - 1 - index) * stagger;
        if (from === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * stagger;
        }
        return index * stagger;
      },
      [elements, from, stagger, split]
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
    }));

    useEffect(() => {
      if (autoStart && !inView) {
        startAnimation();
      }
    }, [autoStart, inView, startAnimation]);

    const extraDelay = typeof transition.delay === "number" ? transition.delay : 0;

    const variants = {
      hidden: { y: "100%" },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay: delay + extraDelay + getStaggerDelay(i),
        },
      }),
    };

    const words: WordObject[] =
      split === "characters"
        ? (elements as WordObject[])
        : (elements as string[]).map((el, i, arr) => ({
            characters: [el],
            needsSpace: split === "words" && i !== arr.length - 1,
          }));

    return (
      <motion.span
        className={cn(
          "flex flex-wrap whitespace-pre-wrap",
          split === "lines" && "flex-col",
          className
        )}
        initial="hidden"
        onViewportEnter={() => {
          if (inView) startAnimation();
        }}
        viewport={{ once, amount: 0.35 }}
        animate={isAnimating ? "visible" : "hidden"}
      >
        <span className="sr-only">{text}</span>

        {words.map((wordObj, wordIndex, array) => {
          const previousCharsCount = array
            .slice(0, wordIndex)
            .reduce((sum, word) => sum + word.characters.length, 0);

          return (
            <span
              key={`${wordObj.characters.join("")}-${wordIndex}`}
              aria-hidden="true"
              className={cn("inline-flex overflow-hidden", wordClass)}
            >
              {wordObj.characters.map((char, charIndex) => (
                <span
                  className={cn(charClass, "relative overflow-hidden whitespace-pre-wrap")}
                  key={`${char}-${charIndex}`}
                >
                  <motion.span
                    custom={previousCharsCount + charIndex}
                    initial="hidden"
                    animate={isAnimating ? "visible" : "hidden"}
                    variants={variants}
                    onAnimationComplete={
                      wordIndex === array.length - 1 &&
                      charIndex === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace && (
                <span className="relative overflow-hidden">
                  <motion.span
                    custom={previousCharsCount + wordObj.characters.length}
                    initial="hidden"
                    animate={isAnimating ? "visible" : "hidden"}
                    variants={variants}
                    className="inline-block"
                  >
                    {" "}
                  </motion.span>
                </span>
              )}
            </span>
          );
        })}
      </motion.span>
    );
  }
);

SlideUpText.displayName = "SlideUpText";

export { SlideUpText };
export type { SlideUpTextProps };
export default SlideUpText;
