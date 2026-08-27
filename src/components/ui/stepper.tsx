import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";

export type StepStatus = "completed" | "current" | "upcoming" | "error";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
  status: StepStatus;
}

export interface StepperProps {
  steps: StepItem[];
  orientation?: "horizontal" | "vertical";
  onStepClick?: (stepId: string | number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  orientation = "horizontal",
  onStepClick,
  className,
}) => {
  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-4 top-8 -bottom-4 w-0.5 -translate-x-1/2 transition-colors",
                    step.status === "completed" ? "bg-brand-950" : "bg-neutral-200"
                  )}
                />
              )}

              {/* Step indicator */}
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick && onStepClick(step.id)}
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors shrink-0 select-none",
                  step.status === "completed" && "bg-brand-950 text-neutral-0",
                  step.status === "current" && "border-2 border-brand-950 bg-neutral-0 text-brand-950 ring-4 ring-brand-50",
                  step.status === "upcoming" && "bg-neutral-100 text-neutral-400 border border-neutral-200",
                  step.status === "error" && "bg-semantic-error text-neutral-0"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : step.status === "error" ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>

              <div className="pt-0.5 space-y-0.5">
                <span
                  className={cn(
                    "text-xs font-semibold block leading-tight",
                    step.status === "current"
                      ? "text-brand-950"
                      : step.status === "error"
                      ? "text-semantic-error"
                      : "text-neutral-700"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[11px] text-neutral-500 block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant (Default)
  return (
    <div className={cn("w-full flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2.5",
                onStepClick && "cursor-pointer group"
              )}
              onClick={() => onStepClick && onStepClick(step.id)}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors shrink-0 select-none",
                  step.status === "completed" && "bg-brand-950 text-neutral-0",
                  step.status === "current" && "border-2 border-brand-950 bg-neutral-0 text-brand-950 ring-4 ring-brand-50",
                  step.status === "upcoming" && "bg-neutral-100 text-neutral-400 border border-neutral-200",
                  step.status === "error" && "bg-semantic-error text-neutral-0"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : step.status === "error" ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </div>

              <div className="hidden sm:block">
                <span
                  className={cn(
                    "text-xs font-semibold block leading-tight",
                    step.status === "current"
                      ? "text-brand-950 font-bold"
                      : step.status === "error"
                      ? "text-semantic-error"
                      : "text-neutral-700"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[10px] text-neutral-500 block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-3 transition-colors",
                  step.status === "completed" ? "bg-brand-950" : "bg-neutral-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
