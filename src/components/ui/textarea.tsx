import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, helperText, error, id, disabled, required, ...props },
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

        <textarea
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "w-full min-h-[96px] p-3 text-sm bg-neutral-0 text-neutral-900 placeholder:text-neutral-400 rounded-md border transition-colors duration-fast outline-none",
            error
              ? "border-semantic-error focus:ring-2 focus:ring-semantic-error/20 focus:border-semantic-error"
              : "border-neutral-300 hover:border-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
            disabled && "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed select-none",
            className
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";
