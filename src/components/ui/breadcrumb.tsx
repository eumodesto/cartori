import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />,
  className,
  ...props
}) => {
  return (
    <nav aria-label="Trilha de navegação (Breadcrumbs)" className={cn("flex items-center text-xs", className)} {...props}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;

          return (
            <li key={item.label + index} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden="true">{separator}</span>}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-neutral-900 truncate"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-neutral-500 truncate">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
