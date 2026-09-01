import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, disabled, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded border transition-colors duration-fast flex items-center justify-center bg-neutral-0 border-neutral-300",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-brand-500",
              "peer-checked:bg-brand-950 peer-checked:border-brand-950 text-neutral-0",
              "peer-hover:border-neutral-400",
              "peer-disabled:bg-neutral-100 peer-disabled:border-neutral-200",
              className
            )}
          >
            <Check
              className={cn(
                "w-3 h-3 stroke-[2.5] transition-opacity",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-neutral-800 leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-neutral-500 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
