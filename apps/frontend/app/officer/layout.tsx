"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenManager } from "@/lib/api";
import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import OfficerSidebar from "@/components/layouts/OfficerSidebar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    officerProfile,
    department,
    profileLoading,
    departmentLoading,
    fetchOfficerProfile,
  } = useOfficerPortalStore();

  useEffect(() => {
    const token = TokenManager.getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // Fetch officer profile when component mounts
    fetchOfficerProfile();
  }, [fetchOfficerProfile, router]);

  // Redirect if not authenticated
  if (!TokenManager.getToken()) {
    return null;
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading officer profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not an officer
  if (officerProfile && officerProfile.user?.role !== "officer") {
    router.replace("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <OfficerSidebar />

        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Officer Portal
                </h1>
                {officerProfile && (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-600">
                      Welcome, {officerProfile.user?.first_name}{" "}
                      {officerProfile.user?.last_name}
                    </p>
                    <Badge variant="secondary">
                      {officerProfile.user?.role}
                    </Badge>
                  </div>
                )}
              </div>

              {department && !departmentLoading && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {department.name}
                  </p>
                  <p className="text-sm text-gray-600">Department</p>
                </div>
              )}

              {departmentLoading && (
                <div className="text-right">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
