import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        "inline-flex items-start gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="relative inline-flex items-center mt-0.5">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors duration-fast bg-neutral-300 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-brand-500",
            checked ? "bg-brand-950" : "bg-neutral-300 hover:bg-neutral-400"
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-neutral-0 shadow-xs transition-transform duration-fast",
            checked && "translate-x-4"
          )}
        />
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
};
