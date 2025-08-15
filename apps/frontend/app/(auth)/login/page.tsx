"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [citizenData, setCitizenData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [officerData, setOfficerData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Citizen login data:", citizenData);
    toast({
      title: "TODO: connect Supabase",
      description: "Citizen login functionality will be implemented later.",
    });
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Officer login data:", officerData);
    toast({
      title: "TODO: connect Supabase",
      description: "Officer login functionality will be implemented later.",
    });
  };

  return (
    <AuthCard title="Sign In" subtitle="Welcome back to OneDesk">
      <Tabs defaultValue="citizen" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="citizen">Citizen</TabsTrigger>
          <TabsTrigger value="officer">Officer</TabsTrigger>
        </TabsList>

        <TabsContent value="citizen" className="space-y-4 mt-4">
          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="citizen-email">Email</Label>
              <Input
                id="citizen-email"
                type="email"
                placeholder="Enter your email"
                value={citizenData.email}
                onChange={(e) =>
                  setCitizenData({ ...citizenData, email: e.target.value })
                }
                className="focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizen-password">Password</Label>
              <PasswordInput
                id="citizen-password"
                placeholder="Enter your password"
                value={citizenData.password}
                onChange={(e) =>
                  setCitizenData({ ...citizenData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="citizen-remember"
                  checked={citizenData.rememberMe}
                  onCheckedChange={(checked: boolean) =>
                    setCitizenData({ ...citizenData, rememberMe: checked })
                  }
                />
                <Label htmlFor="citizen-remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
              Sign In
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="officer" className="space-y-4 mt-4">
          <form onSubmit={handleOfficerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officer-email">Email</Label>
              <Input
                id="officer-email"
                type="email"
                placeholder="Enter your email"
                value={officerData.email}
                onChange={(e) =>
                  setOfficerData({ ...officerData, email: e.target.value })
                }
                className="focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officer-password">Password</Label>
              <PasswordInput
                id="officer-password"
                placeholder="Enter your password"
                value={officerData.password}
                onChange={(e) =>
                  setOfficerData({ ...officerData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
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
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
              Note: Officer accounts are provisioned by admin.
            </p>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Are you a citizen?{" "}
              <button
                type="button"
                onClick={() => {
                  /* Switch to citizen tab */
                }}
                className="text-primary hover:underline"
              >
                Switch to citizen login
              </button>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </AuthCard>
  );
}
