"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { Timeslot } from "@/lib/api";
import { cn } from "@/lib/utils";

// Helper function to format time from HH:MM to readable format
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

interface TimeslotGridProps {
  timeslots: Timeslot[];
  selectedTimeslotId?: number;
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

        // Use the correct properties from the backend response
        const capacity = timeslot.capacity;
        const slotsAvailable = timeslot.slots_available;
        const bookedSlots = capacity - slotsAvailable;

        // Check if the timeslot is full (no available slots)
        const isFull = slotsAvailable === 0;
        const isAvailable = slotsAvailable > 0;

        // Create availability text
        const availabilityText = isFull
          ? "Full"
          : slotsAvailable === 1
            ? "1 slot left"
            : `${slotsAvailable} slots left`;

        return (
          <Button
            key={timeslot.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto p-4 flex flex-col items-center justify-center space-y-2 transition-all border-2",
              isSelected &&
                "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 border-blue-600",
              isFull &&
                "opacity-60 cursor-not-allowed border-red-200 bg-red-50",
              isAvailable &&
                !isSelected &&
                "hover:border-blue-400 hover:bg-blue-50 border-gray-200",
              !isAvailable && !isFull && "border-gray-200 bg-gray-50"
            )}
            disabled={isFull}
            onClick={() => isAvailable && onTimeslotSelect(timeslot)}
          >
            {/* Service name (if available) */}
            {timeslot.service?.name && (
              <div className="text-xs text-center text-gray-600 font-medium mb-1">
                {timeslot.service.name}
              </div>
            )}

            {/* Time Range */}
            <div className="font-medium text-sm">
              {formatTime(timeslot.start_time)} -{" "}
              {formatTime(timeslot.end_time)}
            </div>

            {/* Date (if needed) */}
            <div className="text-xs text-gray-500">
              {new Date(timeslot.slot_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>

            {/* Availability Status */}
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span
                className={cn(
                  "text-xs font-medium",
                  isFull ? "text-red-600" : "text-green-600"
                )}
              >
                {availabilityText}
              </span>
            </div>

            {/* Capacity Badge */}
            <Badge
              variant={isAvailable ? "secondary" : "destructive"}
              className={cn(
                "text-xs px-2 py-0.5",
                isAvailable && "bg-green-100 text-green-800 border-green-200",
                isFull && "bg-red-100 text-red-800 border-red-200"
              )}
            >
              {bookedSlots}/{capacity} booked
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
