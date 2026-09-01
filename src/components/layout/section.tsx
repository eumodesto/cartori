import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  actions,
  children,
  className,
  ...props
}) => {
  return (
    <section className={cn("space-y-4 my-8", className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 font-serif">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-neutral-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}

      {children}
    </section>
  );
};
