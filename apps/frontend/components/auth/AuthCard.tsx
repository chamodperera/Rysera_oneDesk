"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "./AuthHeader";
import { DemoBanner } from "./DemoBanner";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showDemoBanner?: boolean;
}

export function AuthCard({
  title,
  subtitle,
  children,
  showDemoBanner = true,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md border border-blue-200/50 shadow-lg">
        <CardHeader className="space-y-4">
          <AuthHeader title={title} subtitle={subtitle} />
          {showDemoBanner && <DemoBanner />}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  );
}
