"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "booked" | "in-progress" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  booked: {
    label: "Booked",
    className: "bg-primary text-primary-foreground hover:bg-primary/80",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100/80",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 hover:bg-green-100/80",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
