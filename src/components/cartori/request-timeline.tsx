"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, ShieldCheck, FileText } from "lucide-react";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming" | "error";
  actor?: string;
  legalNote?: string;
}

export interface RequestTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({
  events,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex items-start gap-3.5 text-xs">
            {/* Connector vertical line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-4 top-7 -bottom-4 w-0.5 -translate-x-1/2 transition-colors",
                  event.status === "completed"
                    ? "bg-brand-950 dark:bg-brand-400"
                    : "bg-neutral-200 dark:bg-neutral-200"
                )}
              />
            )}

            {/* Event indicator node */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 select-none transition-all shadow-2xs",
                event.status === "completed" && "bg-brand-950 dark:bg-brand-500 text-neutral-0",
                event.status === "current" && "border-2 border-brand-950 dark:border-brand-400 bg-neutral-0 text-brand-950 dark:text-brand-300 ring-4 ring-brand-50 dark:ring-brand-950/40",
                event.status === "upcoming" && "bg-neutral-100 dark:bg-neutral-100/50 text-neutral-400 border border-neutral-200 dark:border-neutral-200",
                event.status === "error" && "bg-semantic-error text-neutral-0 ring-4 ring-semantic-error-bg"
              )}
            >
              {event.status === "completed" ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : event.status === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : event.status === "current" ? (
                <Clock className="w-4 h-4 animate-pulse" />
              ) : (
                <span className="text-[11px] font-mono">{index + 1}</span>
              )}
            </div>

            {/* Event content */}
            <div className="pt-1 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={cn(
                    "font-bold text-xs leading-tight",
                    event.status === "current"
                      ? "text-brand-950 dark:text-brand-300"
                      : event.status === "error"
                      ? "text-semantic-error font-bold"
                      : event.status === "completed"
                      ? "text-neutral-900"
                      : "text-neutral-500"
                  )}
                >
                  {event.title}
                </span>
                {event.timestamp && (
                  <span className="text-[10px] text-neutral-400 shrink-0 font-mono bg-neutral-100 dark:bg-neutral-100/40 px-1.5 py-0.2 rounded">
                    {event.timestamp}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {event.description}
                </p>
              )}

              {event.legalNote && (
                <div className="text-[10px] text-brand-900 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 px-2 py-1 rounded">
                  ⚖️ {event.legalNote}
                </div>
              )}

              {event.actor && (
                <span className="text-[10px] text-neutral-400 block">
                  Responsável: <strong className="text-neutral-600 dark:text-neutral-400 font-medium">{event.actor}</strong>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
