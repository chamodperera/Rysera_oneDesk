import { Service, Timeslot, Feedback } from "./booking-types";
import { services, timeslots } from "./demo-data";

// Date and time formatting
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Duration formatting
export const humanServiceDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

// Booking reference generator
export const generateBookingRef = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `BK-${year}${month}${day}-${random}`;
};

// Data lookup functions
export const findServiceById = (serviceId: string): Service | undefined => {
  return services.find((service) => service.id === serviceId);
};

export const getServiceById = (serviceId: string): Service | undefined => {
  return findServiceById(serviceId);
};

export const findTimeslotById = (timeslotId: string): Timeslot | undefined => {
  return timeslots.find((slot) => slot.id === timeslotId);
};

export const getTimeslotById = (timeslotId: string): Timeslot | undefined => {
  return findTimeslotById(timeslotId);
};

export const getTimeslotsForServiceOnDate = (
  serviceId: string,
  date: string
): Timeslot[] => {
  return timeslots
    .filter((slot) => slot.serviceId === serviceId && slot.date === date)
    .sort((a, b) => a.start.localeCompare(b.start));
};

export const getAvailableDatesForService = (
  serviceId: string,
  daysAhead: number = 14
): string[] => {
  const availableDates = new Set<string>();
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0];
    const slotsForDate = getTimeslotsForServiceOnDate(serviceId, dateStr);

    // Only include dates that have available slots
    if (slotsForDate.some((slot) => slot.available > 0)) {
      availableDates.add(dateStr);
    }
  }

  return Array.from(availableDates).sort();
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Check if a date is disabled (past date or weekend)
export const isDateDisabled = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Disable past dates
  if (checkDate <= today) {
    return true;
  }

  // Disable weekends
  const dayOfWeek = checkDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Get next available date for a service
export const getNextAvailableDate = (serviceId: string): string | null => {
  const availableDates = getAvailableDatesForService(serviceId);
  return availableDates.length > 0 ? availableDates[0] : null;
};

// Feedback utilities
export const formatStars = (rating: number): string => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

export const toCsv = (
  feedbacks: Feedback[],
  servicesMap: Map<string, Service>
): string => {
  if (feedbacks.length === 0) {
    return "No data to export";
  }

  const headers = [
    "Feedback ID",
    "Appointment ID",
    "Service Name",
    "Department",
    "Rating",
    "Stars",
    "Comment",
    "Created Date",
  ];

  const rows = feedbacks.map((feedback) => {
    const service = servicesMap.get(feedback.serviceId);
    return [
      feedback.id,
      feedback.appointmentId,
      service?.name || "Unknown Service",
      service?.departmentId || "Unknown Department",
      feedback.rating,
      formatStars(feedback.rating),
      feedback.comment ? `"${feedback.comment.replace(/"/g, '""')}"` : "",
      new Date(feedback.createdAt).toLocaleDateString(),
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};

export const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
