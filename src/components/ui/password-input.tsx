"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

/** Campo de senha com botão de olho para mostrar ou esconder o que foi digitado. */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  (props, ref) => {
    const [visible, setVisible] = React.useState(false);
    const Icon = visible ? EyeOff : Eye;
    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={visible}
            disabled={props.disabled}
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Icon className="h-4 w-4" />
          </button>
        }
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
