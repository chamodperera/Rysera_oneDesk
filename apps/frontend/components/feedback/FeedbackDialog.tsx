"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, MessageSquare, Star } from "lucide-react";
import { Appointment, Service, Rating, Timeslot } from "@/lib/booking-types";
import { formatDate, formatTime } from "@/lib/demo-utils";
import { useAppointments } from "@/lib/demo-store";
import { toast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  appointment: Appointment;
  service: Service;
  timeslot: Timeslot;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({
  appointment,
  service,
  timeslot,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: FeedbackDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [rating, setRating] = useState<Rating>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const { addFeedback, getFeedbackByAppointment } = useAppointments();

  // Check if feedback already exists
  const existingFeedback = getFeedbackByAppointment(appointment.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addFeedback({
        appointmentId: appointment.id,
        userId: appointment.userId,
        serviceId: appointment.serviceId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Feedback submitted",
        description:
          "Thank you for your feedback! It helps us improve our services.",
      });

      setOpen(false);
      setComment("");
      setRating(5);
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingFeedback) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {!controlledOpen && children && (
          <DialogTrigger asChild>{children}</DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Feedback Already Submitted
            </DialogTitle>
            <DialogDescription>
              You&apos;ve already provided feedback for this appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Rating:</span>
                <StarRating value={existingFeedback.rating} readonly />
              </div>
              {existingFeedback.comment && (
                <div>
                  <span className="font-medium">Your Comment:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {existingFeedback.comment}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Submitted on {formatDate(existingFeedback.createdAt)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && children && (
        <DialogTrigger asChild>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            How was your experience with this service? Your feedback helps us
            improve.
          </DialogDescription>
        </DialogHeader>

        {/* Service Summary */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{service.name}</h4>
            <Badge variant="secondary">{service.departmentId}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(timeslot.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(`${timeslot.start}-${timeslot.end}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Government Service Center</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-3">
              <StarRating
                value={rating}
                onChange={setRating}
                size="lg"
                showLabel
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Additional Comments
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience... What went well? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
