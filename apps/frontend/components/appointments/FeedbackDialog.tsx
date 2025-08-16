"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, comment: string) => void;
  bookingRef: string;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  bookingRef,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, comment);
      onOpenChange(false);
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setComment("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md focus-visible:ring-2 focus-visible:ring-primary">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              How was your experience with appointment{" "}
              <strong>{bookingRef}</strong>?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      hoveredRating >= star || rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {rating > 0 && (
                <span>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="feedback-comment" className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              id="feedback-comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
