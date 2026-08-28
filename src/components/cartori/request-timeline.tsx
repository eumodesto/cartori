import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming" | "error";
  actor?: string;
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
          <div key={event.id} className="relative flex items-start gap-3 text-xs">
            {/* Connector vertical line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-3.5 top-6 -bottom-4 w-0.5 -translate-x-1/2 transition-colors",
                  event.status === "completed" ? "bg-brand-950" : "bg-neutral-200"
                )}
              />
            )}

            {/* Event indicator node */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 select-none",
                event.status === "completed" && "bg-brand-950 text-neutral-0",
                event.status === "current" && "border-2 border-brand-950 bg-neutral-0 text-brand-950 ring-4 ring-brand-50",
                event.status === "upcoming" && "bg-neutral-100 text-neutral-400 border border-neutral-200",
                event.status === "error" && "bg-semantic-error text-neutral-0"
              )}
            >
              {event.status === "completed" ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : event.status === "error" ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Event content */}
            <div className="pt-1 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "font-semibold text-xs leading-tight",
                    event.status === "current"
                      ? "text-brand-950 font-bold"
                      : event.status === "error"
                      ? "text-semantic-error"
                      : "text-neutral-800"
                  )}
                >
                  {event.title}
                </span>
                {event.timestamp && (
                  <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                    {event.timestamp}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {event.description}
                </p>
              )}

              {event.actor && (
                <span className="text-[10px] text-neutral-400 block pt-0.5">
                  Responsável: {event.actor}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
