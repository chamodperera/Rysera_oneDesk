"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating } from "@/lib/booking-types";

interface StarRatingProps {
  value: Rating;
  onChange?: (rating: Rating) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
  showLabel?: boolean;
}

const starSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
  className,
  showLabel = false,
}: StarRatingProps) {
  const handleClick = (rating: Rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, rating: Rating) => {
    if (!readonly && onChange) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onChange(rating);
      }
      if (event.key === "ArrowLeft" && rating > 1) {
        event.preventDefault();
        onChange((rating - 1) as Rating);
      }
      if (event.key === "ArrowRight" && rating < 5) {
        event.preventDefault();
        onChange((rating + 1) as Rating);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating as Rating)}
          onKeyDown={(e) => handleKeyDown(e, rating as Rating)}
          disabled={readonly}
          className={cn(
            "transition-colors focus:outline-none",
            !readonly &&
              "hover:scale-110 focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
            readonly && "cursor-default"
          )}
          aria-label={`Rate ${rating} stars - ${ratingLabels[rating as Rating]}`}
          tabIndex={readonly ? -1 : 0}
        >
          <Star
            className={cn(
              starSizes[size],
              "transition-colors",
              rating <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200",
              !readonly &&
                rating <= value &&
                "hover:fill-yellow-500 hover:text-yellow-500"
            )}
          />
        </button>
      ))}
      {showLabel && (
        <span className="ml-2 text-sm text-muted-foreground">
          {ratingLabels[value]}
        </span>
      )}
    </div>
  );
}
