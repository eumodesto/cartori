"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function HomeHashLink({
  hash,
  className,
  children,
}: {
  hash: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const href = `/#${hash}`;

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
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
