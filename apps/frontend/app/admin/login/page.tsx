"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, ArrowRight, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [officerData, setOfficerData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate admin login process
    setTimeout(() => {
      toast({
        title: "Admin login (demo)",
        description: "Successfully logged in as administrator",
      });
      setIsLoading(false);
      // Store admin session
      if (typeof window !== "undefined") {
        localStorage.setItem("onedesk-admin-session", "true");
        localStorage.setItem("onedesk-user-role", "admin");
      }
      router.push("/admin");
    }, 1000);
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate officer login process
    setTimeout(() => {
      toast({
        title: "Officer login (demo)",
        description: "Successfully logged in as officer",
      });
      setIsLoading(false);
      // Store officer session
      if (typeof window !== "undefined") {
        localStorage.setItem("onedesk-admin-session", "true");
        localStorage.setItem("onedesk-user-role", "officer");
      }
      router.push("/admin");
    }, 1000);
  };

  const handleContinueToAdmin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onedesk-admin-session", "true");
      localStorage.setItem("onedesk-user-role", "admin");
    }
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Government Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to access the administrative dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Staff Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Choose your role and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Administrator</TabsTrigger>
                <TabsTrigger value="officer">Officer</TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4 mt-4">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={adminData.email}
                        onChange={(e) =>
                          setAdminData({ ...adminData, email: e.target.value })
                        }
                        className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={adminData.password}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            password: e.target.value,
                          })
                        }
                        className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin-remember"
                      checked={adminData.rememberMe}
                      onCheckedChange={(checked: boolean) =>
                        setAdminData({ ...adminData, rememberMe: checked })
                      }
                    />
                    <Label htmlFor="admin-remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="officer" className="space-y-4 mt-4">
                <form onSubmit={handleOfficerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="officer-email">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="officer-email"
                        type="email"
                        placeholder="officer@example.com"
                        value={officerData.email}
                        onChange={(e) =>
                          setOfficerData({
                            ...officerData,
                            email: e.target.value,
                          })
                        }
                        className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officer-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="officer-password"
                        type="password"
                        placeholder="Enter your password"
                        value={officerData.password}
                        onChange={(e) =>
                          setOfficerData({
                            ...officerData,
                            password: e.target.value,
                          })
                        }
                        className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="officer-remember"
                      checked={officerData.rememberMe}
                      onCheckedChange={(checked: boolean) =>
                        setOfficerData({ ...officerData, rememberMe: checked })
                      }
                    />
                    <Label htmlFor="officer-remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Officer"}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
                    Note: Officer accounts are provisioned by admin.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Demo Section */}
            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  This is a demo environment
                </p>
                <Button
                  variant="outline"
                  onClick={handleContinueToAdmin}
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Continue to Admin Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Main Site */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
