import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  allowDeselect?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  helperText,
  error,
  className,
  disabled = false,
  allowDeselect = false,
}) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <span className="block text-sm font-medium text-neutral-800">
          {label}
        </span>
      )}

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              onClick={(event) => {
                if (allowDeselect && isSelected && !isDisabled) {
                  event.preventDefault();
                  onChange("");
                }
              }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md border transition-colors duration-fast cursor-pointer select-none",
                isSelected
                  ? "bg-brand-50/50 border-brand-500"
                  : "bg-neutral-0 border-neutral-200 hover:border-neutral-300",
                isDisabled && "opacity-50 cursor-not-allowed bg-neutral-50"
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onChange(option.value)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors bg-neutral-0 border-neutral-300",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-brand-500",
                    isSelected ? "border-brand-950" : "peer-hover:border-neutral-400"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-brand-950" />
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-900 leading-tight">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-neutral-500 mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error ? (
        <p className="text-xs text-semantic-error">{error}</p>
      ) : (
        helperText && <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};
