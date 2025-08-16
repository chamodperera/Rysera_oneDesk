"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { Timeslot } from "@/lib/booking-types";
import { formatTime } from "@/lib/demo-utils";
import { cn } from "@/lib/utils";

interface TimeslotGridProps {
  timeslots: Timeslot[];
  selectedTimeslotId?: string;
  onTimeslotSelect: (timeslot: Timeslot) => void;
  loading?: boolean;
}

export function TimeslotGrid({
  timeslots,
  selectedTimeslotId,
  onTimeslotSelect,
  loading = false,
}: TimeslotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (timeslots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">No timeslots available</p>
        <p className="text-sm text-gray-500">Please select a different date</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {timeslots.map((timeslot) => {
        const isSelected = selectedTimeslotId === timeslot.id;
        const isAvailable = timeslot.available > 0;
        const availabilityText =
          timeslot.available === 1 ? "1 left" : `${timeslot.available} left`;

        return (
          <Button
            key={timeslot.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto p-3 flex flex-col items-center justify-center space-y-1 transition-all",
              isSelected &&
                "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
              !isAvailable && "opacity-50 cursor-not-allowed",
              isAvailable &&
                !isSelected &&
                "hover:border-primary hover:bg-blue-50"
            )}
            disabled={!isAvailable}
            onClick={() => isAvailable && onTimeslotSelect(timeslot)}
          >
            {/* Time Range */}
            <div className="font-medium text-sm">
              {formatTime(timeslot.start)}
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span className="text-xs">
                {isAvailable ? availabilityText : "Full"}
              </span>
            </div>

            {/* Capacity Badge */}
            <Badge
              variant={isAvailable ? "secondary" : "destructive"}
              className={cn(
                "text-xs px-1 py-0",
                isAvailable && "bg-green-100 text-green-800",
                !isAvailable && "bg-red-100 text-red-800"
              )}
            >
              {timeslot.available}/{timeslot.capacity}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
