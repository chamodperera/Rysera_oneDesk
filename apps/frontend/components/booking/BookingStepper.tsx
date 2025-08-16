"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface BookingStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps: Step[] = [
  { id: 1, title: "Details", description: "Service information" },
  { id: 2, title: "Date", description: "Pick a date" },
  { id: 3, title: "Time", description: "Choose timeslot" },
  { id: 4, title: "Documents", description: "Upload files" },
  { id: 5, title: "Review", description: "Confirm booking" },
];

export function BookingStepper({
  currentStep,
  onStepClick,
}: BookingStepperProps) {
  return (
    <div className="w-full py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = onStepClick && step.id <= currentStep;

            return (
              <li key={step.id} className="flex-1">
                <div
                  className={cn(
                    "group flex flex-col items-center",
                    isClickable && "cursor-pointer"
                  )}
                  onClick={() => isClickable && onStepClick(step.id)}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary bg-white text-primary",
                      !isCompleted &&
                        !isCurrent &&
                        "border-gray-300 bg-white text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-primary",
                        isCompleted && "text-primary",
                        !isCompleted && !isCurrent && "text-gray-500"
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {stepIdx < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute mt-5 h-0.5 w-full transition-colors",
                      step.id < currentStep ? "bg-primary" : "bg-gray-300"
                    )}
                    style={{
                      left: "50%",
                      width: `calc(100% / ${steps.length} - 2.5rem)`,
                      marginLeft: "1.25rem",
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
