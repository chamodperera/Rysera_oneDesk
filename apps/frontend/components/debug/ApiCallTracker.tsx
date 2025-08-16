"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// API call tracker
let apiCallCount = 0;
const apiCallLog: { timestamp: string; endpoint: string; method: string }[] =
  [];

// Override fetch to track API calls
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  apiCallCount++;
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const method = init?.method || "GET";

  if (url.includes("/api/")) {
    apiCallLog.push({
      timestamp: new Date().toLocaleTimeString(),
      endpoint: url.replace(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
        ""
      ),
      method,
    });

    // Keep only last 20 calls
    if (apiCallLog.length > 20) {
      apiCallLog.shift();
    }
  }

  return originalFetch(input, init);
};

export function ApiCallTracker() {
  const [, setRefreshCount] = useState(0);

  // Force re-render every second to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recentCalls = apiCallLog.slice(-10); // Show last 10 calls

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Call Monitor
          <Badge variant="outline">{apiCallCount} total calls</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent API Calls:</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {recentCalls.length === 0 ? (
              <p className="text-sm text-gray-500">No API calls yet</p>
            ) : (
              recentCalls.map((call, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-mono">{call.method}</span>
                    <span className="text-gray-500">{call.timestamp}</span>
                  </div>
                  <div className="text-gray-700 truncate" title={call.endpoint}>
                    {call.endpoint}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
