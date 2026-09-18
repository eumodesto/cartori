"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  COMPANY_DASHBOARD_PATH,
  COMPANY_SIGNUP_PATH,
  requestAuthIntent,
} from "@/lib/auth-intent";

export function useBusinessSignup() {
  const { profile, isBusiness, loading } = useAuth();
  const href = profile
    ? isBusiness
      ? "/painel"
      : COMPANY_DASHBOARD_PATH
    : COMPANY_SIGNUP_PATH;

  const open = () => {
    if (loading) return;
    if (profile) {
      window.location.assign(href);
      return;
    }
    requestAuthIntent({ mode: "signup", intent: "company" });
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", COMPANY_SIGNUP_PATH);
    }
  };

  return { href, open, loading, isLoggedIn: Boolean(profile) };
}

export function BusinessSignupLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { href, open, isLoggedIn } = useBusinessSignup();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (isLoggedIn) return;
        event.preventDefault();
        open();
      }}
    >
      {children}
    </Link>
  );
}
