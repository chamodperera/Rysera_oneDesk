"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "@/components/auth/AuthCard";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);
  }, [searchParams]);

  return (
    <AuthCard title="Email Verification" subtitle="Verify your email address">
      {token && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Verification token: {token.substring(0, 8)}...
          </p>
        </div>
      )}

      {/* Demo Toggle */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <Label htmlFor="demo-toggle" className="text-sm font-medium">
          Demo: Toggle verification state
        </Label>
        <div className="flex items-center space-x-2 mt-2">
          <Button
            type="button"
            variant={isSuccess ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSuccess(true)}
            className={isSuccess ? "bg-primary text-primary-foreground" : ""}
          >
            Success
          </Button>
          <Button
            type="button"
            variant={!isSuccess ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsSuccess(false)}
          >
            Failure
          </Button>
        </div>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <Alert className="border-green-200 bg-green-50/50 text-green-800 mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Email verified successfully! Your account is now active!
          </AlertDescription>
        </Alert>
      ) : (
        /* Failure State */
        <Alert className="border-red-200 bg-red-50/50 text-red-800 mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid or expired verification link. Please request a new
            verification email.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {isSuccess ? (
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Link href="/login">Continue to Login</Link>
          </Button>
        ) : (
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Link href="/register">Request New Verification</Link>
          </Button>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
