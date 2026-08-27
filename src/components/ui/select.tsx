import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options = [],
      placeholder,
      id,
      disabled,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-800 select-none"
          >
            {label} {required && <span className="text-semantic-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-10 pl-3.5 pr-10 text-sm bg-neutral-0 text-neutral-900 rounded-md border transition-colors duration-fast outline-none appearance-none cursor-pointer",
              error
                ? "border-semantic-error focus:ring-2 focus:ring-semantic-error/20 focus:border-semantic-error text-semantic-error"
                : "border-neutral-300 hover:border-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
              disabled && "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed select-none",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-neutral-400">
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 flex items-center pointer-events-none text-neutral-500">
            {error ? (
              <AlertCircle className="w-4 h-4 text-semantic-error" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-semantic-error">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={helperId} className="text-xs text-neutral-500">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
