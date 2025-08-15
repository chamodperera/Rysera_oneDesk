"use client";

import {
  Appointment,
  Service,
  Timeslot,
  ScheduleTemplate,
  ScheduleException,
  Feedback,
  Rating,
} from "./booking-types";
import { generateBookingRef } from "./demo-utils";
import {
  services as defaultServices,
  timeslots as defaultTimeslots,
  scheduleTemplates as defaultTemplates,
  scheduleExceptions as defaultExceptions,
} from "./demo-data";

class AppointmentStore {
  private appointments: Appointment[] = [];
  private feedbacks: Feedback[] = [];
  private services: Service[] = [];
  private timeslots: Timeslot[] = [];
  private templates: ScheduleTemplate[] = [];
  private exceptions: ScheduleException[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    // Initialize with default data
    this.services = [...defaultServices];
    this.timeslots = [...defaultTimeslots];
    this.templates = [...defaultTemplates];
    this.exceptions = [...defaultExceptions];

    // Load from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("onedesk-appointments");
        if (stored) {
          this.appointments = JSON.parse(stored);
        }
        const storedFeedbacks = localStorage.getItem("onedesk-feedbacks");
        if (storedFeedbacks) {
          this.feedbacks = JSON.parse(storedFeedbacks);
        } else {
          // Initialize with sample feedback data if none exists
          this.initializeSampleFeedbacks();
        }
        const storedServices = localStorage.getItem("onedesk-services");
        if (storedServices) {
          this.services = JSON.parse(storedServices);
        }
        const storedTimeslots = localStorage.getItem("onedesk-timeslots");
        if (storedTimeslots) {
          this.timeslots = JSON.parse(storedTimeslots);
        }
        const storedTemplates = localStorage.getItem("onedesk-templates");
        if (storedTemplates) {
          this.templates = JSON.parse(storedTemplates);
        }
        const storedExceptions = localStorage.getItem("onedesk-exceptions");
        if (storedExceptions) {
          this.exceptions = JSON.parse(storedExceptions);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "onedesk-appointments",
          JSON.stringify(this.appointments)
        );
        localStorage.setItem(
          "onedesk-feedbacks",
          JSON.stringify(this.feedbacks)
        );
        localStorage.setItem("onedesk-services", JSON.stringify(this.services));
        localStorage.setItem(
          "onedesk-timeslots",
          JSON.stringify(this.timeslots)
        );
        localStorage.setItem(
          "onedesk-templates",
          JSON.stringify(this.templates)
        );
        localStorage.setItem(
          "onedesk-exceptions",
          JSON.stringify(this.exceptions)
        );
      } catch (error) {
        console.error("Failed to save data:", error);
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private initializeSampleFeedbacks() {
    // Sample feedback data for demo purposes
    const sampleFeedbacks: Feedback[] = [
      {
        id: "fb-1",
        appointmentId: "app-1",
        userId: "user-1",
        serviceId: "passport-renewal",
        rating: 5,
        comment:
          "Excellent service! The staff was very helpful and the process was smooth.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: "fb-2",
        appointmentId: "app-2",
        userId: "user-2",
        serviceId: "drivers-license",
        rating: 4,
        comment:
          "Good service overall. The wait time was a bit longer than expected but the staff was professional.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        id: "fb-3",
        appointmentId: "app-3",
        userId: "user-3",
        serviceId: "business-license",
        rating: 5,
        comment:
          "Amazing experience! Everything was well organized and efficient.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: "fb-4",
        appointmentId: "app-4",
        userId: "user-4",
        serviceId: "property-tax",
        rating: 3,
        comment:
          "Service was okay but could be improved. The website could be more user-friendly.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        id: "fb-5",
        appointmentId: "app-5",
        userId: "user-5",
        serviceId: "passport-renewal",
        rating: 4,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
    ];

    this.feedbacks = sampleFeedbacks;
    this.save();
  }

  createAppointment(
    data: Omit<Appointment, "id" | "bookingRef" | "createdAt">
  ): string {
    const id = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const bookingRef = generateBookingRef();
    const createdAt = new Date().toISOString();

    const appointment: Appointment = {
      ...data,
      id,
      bookingRef,
      createdAt,
    };

    this.appointments.push(appointment);
    this.save();
    return bookingRef;
  }

  cancelAppointment(id: string) {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === id
        ? { ...appointment, status: "cancelled" as const }
        : appointment
    );
    this.save();
  }

  updateAppointmentStatus(id: string, status: Appointment["status"]) {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, status } : appointment
    );
    this.save();
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find((appointment) => appointment.id === id);
  }

  getAppointmentByRef(bookingRef: string): Appointment | undefined {
    return this.appointments.find(
      (appointment) => appointment.bookingRef === bookingRef
    );
  }

  listAppointments(filter?: Appointment["status"]): Appointment[] {
    const appointments = this.appointments;
    if (!filter) {
      return appointments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return appointments
      .filter((appointment) => appointment.status === filter)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  updateAppointmentDocs(
    id: string,
    docs: { name: string; type: string; size: number }[]
  ) {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, docs } : appointment
    );
    this.save();
  }

  addFeedback(feedbackData: Omit<Feedback, "id" | "createdAt">): Feedback {
    const feedback: Feedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };
    this.feedbacks.push(feedback);
    this.save();
    return feedback;
  }

  updateFeedback(id: string, patch: Partial<Feedback>): void {
    this.feedbacks = this.feedbacks.map((feedback) =>
      feedback.id === id ? { ...feedback, ...patch } : feedback
    );
    this.save();
  }

  getFeedbackByAppointment(appointmentId: string): Feedback | undefined {
    return this.feedbacks.find((f) => f.appointmentId === appointmentId);
  }

  getServiceFeedback(serviceId: string): Feedback[] {
    return this.feedbacks.filter((f) => f.serviceId === serviceId);
  }

  getServiceRatingStats(serviceId: string): {
    count: number;
    avg: number;
    buckets: Record<Rating, number>;
  } {
    const serviceFeedbacks = this.getServiceFeedback(serviceId);
    const count = serviceFeedbacks.length;

    if (count === 0) {
      return {
        count: 0,
        avg: 0,
        buckets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const buckets: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    serviceFeedbacks.forEach((feedback) => {
      buckets[feedback.rating]++;
      totalRating += feedback.rating;
    });

    return {
      count,
      avg: totalRating / count,
      buckets,
    };
  }

  getAllFeedbacks(): Feedback[] {
    return [...this.feedbacks];
  }

  // Legacy method for backwards compatibility
  getFeedback(appointmentId: string): Feedback | undefined {
    return this.getFeedbackByAppointment(appointmentId);
  }

  // Admin methods
  getServices(): Service[] {
    return [...this.services];
  }

  getTimeslots(): Timeslot[] {
    return [...this.timeslots];
  }

  getTemplates(): ScheduleTemplate[] {
    return [...this.templates];
  }

  getExceptions(): ScheduleException[] {
    return [...this.exceptions];
  }

  upsertService(service: Service) {
    const index = this.services.findIndex((s) => s.id === service.id);
    if (index >= 0) {
      this.services[index] = service;
    } else {
      this.services.push(service);
    }
    this.save();
  }

  toggleServiceActive(id: string) {
    this.services = this.services.map((service) =>
      service.id === id ? { ...service, active: !service.active } : service
    );
    this.save();
  }

  addTemplate(template: ScheduleTemplate) {
    this.templates.push(template);
    this.save();
  }

  updateTemplate(template: ScheduleTemplate) {
    this.templates = this.templates.map((t) =>
      t.id === template.id ? template : t
    );
    this.save();
  }

  removeTemplate(id: string) {
    this.templates = this.templates.filter((t) => t.id !== id);
    this.save();
  }

  addException(exception: ScheduleException) {
    this.exceptions.push(exception);
    this.save();
  }

  updateException(exception: ScheduleException) {
    this.exceptions = this.exceptions.map((e) =>
      e.id === exception.id ? exception : e
    );
    this.save();
  }

  removeException(id: string) {
    this.exceptions = this.exceptions.filter((e) => e.id !== id);
    this.save();
  }

  setAppointmentStatus(id: string, status: Appointment["status"]) {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, status } : appointment
    );
    this.save();
  }

  createTimeslotsFromTemplate(
    templateId: string,
    { startDate, endDate }: { startDate: string; endDate: string }
  ) {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const newTimeslots: Timeslot[] = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      if (!template.daysOfWeek.includes(dayOfWeek)) continue;

      const dateStr = date.toISOString().split("T")[0];

      // Generate time slots for this day
      let currentTime = template.startTime;
      let slotIndex = 0;

      while (currentTime < template.endTime) {
        // Check if current time is during a break
        const isBreak = template.breaks?.some(
          (breakTime) =>
            currentTime >= breakTime.start && currentTime < breakTime.end
        );

        if (!isBreak) {
          const endTime = this.addMinutesToTime(
            currentTime,
            template.intervalMinutes
          );

          newTimeslots.push({
            id: `slot-${template.serviceId}-${dateStr}-${slotIndex}`,
            serviceId: template.serviceId,
            date: dateStr,
            start: currentTime,
            end: endTime,
            capacity: template.capacityPerSlot,
            available: template.capacityPerSlot,
          });
        }

        currentTime = this.addMinutesToTime(
          currentTime,
          template.intervalMinutes
        );
        slotIndex++;
      }
    }

    // Merge with existing timeslots (avoid duplicates)
    newTimeslots.forEach((newSlot) => {
      const exists = this.timeslots.some(
        (existing) =>
          existing.serviceId === newSlot.serviceId &&
          existing.date === newSlot.date &&
          existing.start === newSlot.start
      );

      if (!exists) {
        this.timeslots.push(newSlot);
      }
    });

    this.save();
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
  }

  applyExceptionsForRange(
    serviceId: string,
    { startDate, endDate }: { startDate: string; endDate: string }
  ) {
    const relevantExceptions = this.exceptions.filter(
      (e) =>
        e.serviceId === serviceId && e.date >= startDate && e.date <= endDate
    );

    relevantExceptions.forEach((exception) => {
      if (exception.type === "closed") {
        // Remove all timeslots for this date
        this.timeslots = this.timeslots.filter(
          (slot) =>
            !(slot.serviceId === serviceId && slot.date === exception.date)
        );
      } else if (
        exception.type === "capacity-override" &&
        exception.capacityOverride
      ) {
        // Update capacity for all slots on this date
        this.timeslots = this.timeslots.map((slot) =>
          slot.serviceId === serviceId && slot.date === exception.date
            ? {
                ...slot,
                capacity: exception.capacityOverride!,
                available: exception.capacityOverride!,
              }
            : slot
        );
      }
    });

    this.save();
  }
}

export const appointmentStore = new AppointmentStore();

// React hook for components
import { useEffect, useState } from "react";

export function useAppointments() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = appointmentStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return {
    appointments: appointmentStore.getAppointments(),
    createAppointment:
      appointmentStore.createAppointment.bind(appointmentStore),
    cancelAppointment:
      appointmentStore.cancelAppointment.bind(appointmentStore),
    updateAppointmentStatus:
      appointmentStore.updateAppointmentStatus.bind(appointmentStore),
    updateAppointmentDocs:
      appointmentStore.updateAppointmentDocs.bind(appointmentStore),
    addFeedback: appointmentStore.addFeedback.bind(appointmentStore),
    updateFeedback: appointmentStore.updateFeedback.bind(appointmentStore),
    getFeedback: appointmentStore.getFeedback.bind(appointmentStore),
    getFeedbackByAppointment:
      appointmentStore.getFeedbackByAppointment.bind(appointmentStore),
    getServiceFeedback:
      appointmentStore.getServiceFeedback.bind(appointmentStore),
    getServiceRatingStats:
      appointmentStore.getServiceRatingStats.bind(appointmentStore),
    getAllFeedbacks: appointmentStore.getAllFeedbacks.bind(appointmentStore),
    getAppointmentById:
      appointmentStore.getAppointmentById.bind(appointmentStore),
    getAppointmentByRef:
      appointmentStore.getAppointmentByRef.bind(appointmentStore),
    listAppointments: appointmentStore.listAppointments.bind(appointmentStore),
    // Admin methods
    getServices: appointmentStore.getServices.bind(appointmentStore),
    getTimeslots: appointmentStore.getTimeslots.bind(appointmentStore),
    getTemplates: appointmentStore.getTemplates.bind(appointmentStore),
    getExceptions: appointmentStore.getExceptions.bind(appointmentStore),
    upsertService: appointmentStore.upsertService.bind(appointmentStore),
    toggleServiceActive:
      appointmentStore.toggleServiceActive.bind(appointmentStore),
    addTemplate: appointmentStore.addTemplate.bind(appointmentStore),
    updateTemplate: appointmentStore.updateTemplate.bind(appointmentStore),
    removeTemplate: appointmentStore.removeTemplate.bind(appointmentStore),
    addException: appointmentStore.addException.bind(appointmentStore),
    updateException: appointmentStore.updateException.bind(appointmentStore),
    removeException: appointmentStore.removeException.bind(appointmentStore),
    setAppointmentStatus:
      appointmentStore.setAppointmentStatus.bind(appointmentStore),
    createTimeslotsFromTemplate:
      appointmentStore.createTimeslotsFromTemplate.bind(appointmentStore),
    applyExceptionsForRange:
      appointmentStore.applyExceptionsForRange.bind(appointmentStore),
  };
}
