"use client";

import { Navigation } from "@/components/navigation";
import { AuthLoader } from "@/components/auth/AuthLoader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthLoader>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        {children}
      </div>
    </AuthLoader>
  );
}
