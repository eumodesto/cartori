import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "rounded";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rounded",
  ...props
}) => {
  const variantStyles = {
    rectangular: "rounded-none",
    rounded: "rounded-md",
    circular: "rounded-full",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-neutral-200",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
