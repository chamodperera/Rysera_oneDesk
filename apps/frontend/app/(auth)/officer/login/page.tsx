"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useToast } from "@/hooks/use-toast";

export default function OfficerLoginPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Officer login data:", formData);
    toast({
      title: "TODO: connect Supabase",
      description: "Officer login functionality will be implemented later.",
    });
  };

  return (
    <AuthCard
      title="Officer Login"
      subtitle="Access OneDesk administrative portal"
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Officer accounts are provisioned by admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your officer email"
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
          Sign In as Officer
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/login#officer" className="text-primary hover:underline">
            Back to main login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
