// Auth loader component to handle authentication state on app startup
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only load user if we have a token but no user data
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("onedesk_token")
        : null;
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, [loadUser, isAuthenticated]);

  return <>{children}</>;
}
