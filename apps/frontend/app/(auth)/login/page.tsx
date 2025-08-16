"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();
  const { login, isLoading, error, clearError } = useAuthStore();

  const returnUrl = searchParams.get("returnUrl");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      success({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      // If there's a return URL, redirect there, otherwise use role-based routing
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        // Get the current user from the store to determine redirect route
        const currentUser = useAuthStore.getState().user;

        // Redirect based on user role
        if (currentUser?.role === "admin" || currentUser?.role === "officer") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } else {
      showError({
        title: "Login Failed",
        description:
          result.error || "Please check your credentials and try again.",
      });
    }
  };

  return (
    <AuthCard title="Sign In" subtitle="Welcome back to OneDesk">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            disabled={isLoading}
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
            disabled={isLoading}
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
              disabled={isLoading}
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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
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
