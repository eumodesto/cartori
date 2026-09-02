"use client";

import * as React from "react";
import { AuthProfile, isPartnerAccount } from "@/lib/auth-types";

type AuthContextValue = {
  profile: AuthProfile | null;
  loading: boolean;
  configured: boolean;
  isPartner: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<AuthProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [configured, setConfigured] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    setConfigured(data.configured !== false);
    setProfile(data.profile || null);
  }, []);

  React.useEffect(() => {
    refresh()
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [refresh]);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
  }, []);

  const value = React.useMemo(
    () => ({
      profile,
      loading,
      configured,
      isPartner: isPartnerAccount(profile),
      refresh,
      logout,
    }),
    [configured, loading, logout, profile, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa do AuthProvider.");
  }
  return ctx;
}
