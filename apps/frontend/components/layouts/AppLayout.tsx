"use client";

import { Navigation } from "@/components/navigation";

// Mock user data - in a real app this would come from auth context
const mockUser = {
  name: "John Doe",
  email: "john.doe@email.com",
  role: "citizen" as const,
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation user={mockUser} />
      {children}
    </div>
  );
}
