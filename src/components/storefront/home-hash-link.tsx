"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function HomeHashLink({
  hash,
  className,
  children,
  onClick,
}: {
  hash: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const href = `/#${hash}`;

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.();
        if (pathname !== "/") return;
        const el = document.getElementById(hash);
        if (!el) return;
        event.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", href);
      }}
    >
      {children}
    </Link>
  );
}
