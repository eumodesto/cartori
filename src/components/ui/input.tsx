import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      required,
      optional,
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
            {!required && optional && (
              <span className="ml-1 align-middle text-[11px] font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 border border-brand-200 rounded px-1.5 py-0.5">
                opcional
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-10 px-3.5 text-sm bg-neutral-0 text-neutral-900 placeholder:text-neutral-400 rounded-md border transition-colors duration-fast outline-none",
              leftIcon ? "pl-10" : "",
              rightIcon || error ? "pr-10" : "",
              error
                ? "border-semantic-error focus:ring-2 focus:ring-semantic-error/20 focus:border-semantic-error text-semantic-error"
                : "border-neutral-300 hover:border-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
              disabled && "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed select-none",
              className
            )}
            {...props}
          />

          {error ? (
            <div className="absolute right-3 flex items-center pointer-events-none text-semantic-error">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3 flex items-center pointer-events-none text-neutral-500">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-semantic-error font-normal">
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

Input.displayName = "Input";
