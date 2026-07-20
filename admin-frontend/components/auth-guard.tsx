"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { apiKey } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!apiKey && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [apiKey, pathname, router]);

  if (!apiKey && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
