"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  apiKey: string | null;
  signIn: (apiKey: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setApiKey(getCookieValue("admin_api_key"));
  }, []);

  const signIn = (key: string) => {
    document.cookie = `admin_api_key=${encodeURIComponent(key)}; path=/; samesite=strict`;
    setApiKey(key);
    router.push("/admin");
  };

  const signOut = () => {
    document.cookie = "admin_api_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";
    setApiKey(null);
    router.push("/admin/login");
  };

  return <AuthContext.Provider value={{ apiKey, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
