"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/AuthCard";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password for:", email);
    toast({
      title: "Reset link sent (demo)",
      description: "Check your email for password reset instructions.",
    });
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-visible:ring-2 focus-visible:ring-primary"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:opacity-90"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href="/reset-password" className="text-primary hover:underline">
            Already have a reset token?
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
