"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Settings,
  Bell,
  User,
  LogOut,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAuthStore,
  useUser,
  useUserRole,
  useIsAuthenticated,
} from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user?: {
    name: string;
    email: string;
    role: "citizen" | "officer" | "admin";
    avatar?: string;
  };
}

export function Navigation({ user: propUser }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { success } = useToast();
  const { logout } = useAuthStore();
  const storeUser = useUser();
  const userRole = useUserRole();
  const isAuthenticated = useIsAuthenticated();

  // Use store user if available, fallback to prop user
  const user = storeUser || propUser;
  const role = userRole || propUser?.role;

  // Helper to get display name
  const getDisplayName = (user: typeof storeUser | typeof propUser) => {
    if (!user) return "";
    if ("name" in user) return user.name;
    return `${user.first_name} ${user.last_name}`;
  };

  // Helper to get initials
  const getInitials = (user: typeof storeUser | typeof propUser) => {
    const name = getDisplayName(user);
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    success({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const citizenNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Calendar },
    { href: "/dashboard/appointments", label: "My Appointments", icon: User },
  ];

  const unauthenticatedNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Calendar },
  ];

  const officerNavItems = [
    { href: "/officer/dashboard", label: "Officer Dashboard", icon: Users },
    { href: "/officer/schedule", label: "Schedule", icon: Calendar },
  ];

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: Settings },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: Settings },
  ];

  const getNavItems = () => {
    if (!isAuthenticated) return unauthenticatedNavItems;
    if (role === "admin") return adminNavItems;
    if (role === "officer") return officerNavItems;
    return citizenNavItems;
  };

  const navItems = getNavItems();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">OneDesk</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-primary">
                  3
                </Badge>
              </Button>
            )}

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={(user as { avatar?: string })?.avatar}
                        alt={getDisplayName(user)}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getDisplayName(user)}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge variant="secondary" className="w-fit">
                        {role === "officer"
                          ? "Officer"
                          : role === "admin"
                            ? "Admin"
                            : "Citizen"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
