"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <Alert className="border-blue-200 bg-blue-50/50 text-blue-800">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Demo: no authentication wired. Connect Supabase later.
      </AlertDescription>
    </Alert>
  );
}
