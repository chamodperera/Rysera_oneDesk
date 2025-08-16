"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Home,
  FileText,
  Settings,
  LogOut,
  Building2,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/officer", icon: Home },
  { name: "My Appointments", href: "/officer/appointments", icon: Calendar },
  { name: "Department", href: "/officer/department", icon: Building2 },
  { name: "Analytics", href: "/officer/analytics", icon: BarChart3 },
  { name: "Schedule", href: "/officer/schedule", icon: Clock },
  { name: "Reports", href: "/officer/reports", icon: FileText },
  { name: "Settings", href: "/officer/settings", icon: Settings },
];

export default function OfficerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { officerProfile, department, stats } = useOfficerPortalStore();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="text-xl font-bold text-blue-600">OneDesk</div>
          <Badge variant="outline" className="ml-2 text-xs">
            Officer
          </Badge>
        </div>

        {/* Officer Info */}
        {officerProfile && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              {officerProfile.user?.first_name} {officerProfile.user?.last_name}
            </div>
            <div className="text-sm text-gray-600">
              {officerProfile.user?.email}
            </div>
            {department && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs">
                  {department.name}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Today&apos;s Overview
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-blue-700 font-medium">{stats.pending}</div>
                <div className="text-blue-600">Pending</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-green-700 font-medium">
                  {stats.confirmed}
                </div>
                <div className="text-green-600">Confirmed</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-blue-50 text-blue-700 border-blue-200"
                )}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
