"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Citizen login data:", formData);
    toast({
      title: "TODO: connect Supabase",
      description: "Citizen login functionality will be implemented later.",
    });
  };

  return (
    <AuthCard title="Sign In" subtitle="Welcome back to OneDesk">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, rememberMe: checked })
              }
            />
            <Label htmlFor="remember" className="text-sm">
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

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            Government employee?
          </p>
          <Link
            href="/admin/login"
            className="text-sm text-primary hover:underline font-medium"
          >
            Access Admin Portal →
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
