import { create } from "zustand";
import {
  timeslotApi,
  appointmentApi,
  type Timeslot,
  type Appointment,
} from "./api";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  documents: File[];
}

interface AppointmentBookingState {
  // State
  loading: boolean;
  error: string | null;

  // Timeslots
  timeslots: Timeslot[];
  timeslotsFetched: boolean;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  selectedTimeslot: Timeslot | null;

  // Appointments
  appointments: Appointment[];
  myAppointments: Appointment[];
  appointmentsFetched: boolean;

  // Booking form
  formData: BookingFormData;

  // Actions
  setSelectedStartDate: (date: Date | null) => void;
  setSelectedEndDate: (date: Date | null) => void;
  setSelectedTimeslot: (timeslot: Timeslot | null) => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  resetForm: () => void;

  // API actions
  fetchTimeslotsByService: (serviceId: number) => Promise<void>;
  fetchAvailableTimeslots: (serviceId: number) => Promise<void>;
  searchTimeslots: (params: {
    fromDate?: string;
    toDate?: string;
    serviceIds?: number[];
    availableOnly?: boolean;
  }) => Promise<void>;

  fetchMyAppointments: () => Promise<void>;
  fetchAppointmentById: (id: number) => Promise<Appointment | null>;
  fetchAppointmentByBookingRef: (
    bookingRef: string
  ) => Promise<Appointment | null>;

  bookAppointment: (
    serviceId: number,
    timeslotId: number,
    userId: number
  ) => Promise<Appointment | null>;
  cancelAppointment: (id: number) => Promise<boolean>;
  updateAppointmentStatus: (
    id: number,
    status: Appointment["status"]
  ) => Promise<boolean>;

  clearError: () => void;
  reset: () => void;
}

const initialFormData: BookingFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  documents: [],
};

export const useAppointmentBookingStore = create<AppointmentBookingState>(
  (set, get) => ({
    // Initial state
    loading: false,
    error: null,
    timeslots: [],
    timeslotsFetched: false,
    selectedStartDate: null,
    selectedEndDate: null,
    selectedTimeslot: null,
    appointments: [],
    myAppointments: [],
    appointmentsFetched: false,
    formData: initialFormData,

    // Basic setters
    setSelectedStartDate: (date) => set({ selectedStartDate: date }),
    setSelectedEndDate: (date) => set({ selectedEndDate: date }),
    setSelectedTimeslot: (timeslot) => set({ selectedTimeslot: timeslot }),
    updateFormData: (data) =>
      set((state) => ({
        formData: { ...state.formData, ...data },
      })),
    resetForm: () => set({ formData: initialFormData }),

    // Timeslot actions
    fetchTimeslotsByService: async (serviceId: number) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true, error: null });

      try {
        const response = await timeslotApi.getByService(serviceId);

        if (response.success && response.data) {
          set({
            timeslots: response.data.data?.timeslots || [],
            timeslotsFetched: true,
            loading: false,
          });
        } else {
          set({
            error: response.message || "Failed to fetch timeslots",
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching timeslots:", error);
        set({
          error: "Failed to fetch timeslots",
          loading: false,
        });
      }
    },

    fetchAvailableTimeslots: async (serviceId: number) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true, error: null });

      try {
        const response = await timeslotApi.getAvailableByService(serviceId);

        if (response.success && response.data) {
          set({
            timeslots: response.data.data?.timeslots || [],
            timeslotsFetched: true,
            loading: false,
          });
        } else {
          set({
            error: response.message || "Failed to fetch available timeslots",
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching available timeslots:", error);
        set({
          error: "Failed to fetch available timeslots",
          loading: false,
        });
      }
    },

    searchTimeslots: async (params) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true, error: null });

      try {
        const response = await timeslotApi.search(params);

        if (response.success && response.data) {
          // Backend returns { success: true, data: { timeslots: [...], search_criteria: {...} } }
          const timeslots = response.data.timeslots || [];

          set({
            timeslots: timeslots,
            loading: false,
          });
        } else {
          set({
            error: response.message || "Failed to search timeslots",
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error searching timeslots:", error);
        set({
          error: "Failed to search timeslots",
          loading: false,
        });
      }
    },

    // Appointment actions
    fetchMyAppointments: async () => {
      const state = get();
      if (state.loading) return;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.getMy();

        if (response.success && response.data) {
          set({
            myAppointments: response.data.data?.appointments || [],
            appointmentsFetched: true,
            loading: false,
          });
        } else {
          set({
            error: response.message || "Failed to fetch appointments",
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        set({
          error: "Failed to fetch appointments",
          loading: false,
        });
      }
    },

    fetchAppointmentById: async (id: number) => {
      const state = get();
      if (state.loading) return null;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.getById(id);

        if (response.success && response.data) {
          set({ loading: false });
          return response.data.appointment;
        } else {
          set({
            error: response.message || "Failed to fetch appointment",
            loading: false,
          });
          return null;
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        set({
          error: "Failed to fetch appointment",
          loading: false,
        });
        return null;
      }
    },

    fetchAppointmentByBookingRef: async (bookingRef: string) => {
      const state = get();
      if (state.loading) return null;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.getByBookingRef(bookingRef);

        if (response.success && response.data) {
          set({ loading: false });
          return response.data.appointment;
        } else {
          set({
            error: response.message || "Failed to fetch appointment",
            loading: false,
          });
          return null;
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        set({
          error: "Failed to fetch appointment",
          loading: false,
        });
        return null;
      }
    },

    bookAppointment: async (
      serviceId: number,
      timeslotId: number,
      userId: number
    ) => {
      const state = get();
      if (state.loading) return null;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.create({
          user_id: userId,
          service_id: serviceId,
          timeslot_id: timeslotId,
        });

        if (response.success && response.data) {
          const newAppointment = response.data.appointment;

          // Update appointments list
          set((state) => ({
            myAppointments: [...state.myAppointments, newAppointment],
            loading: false,
            selectedTimeslot: null, // Clear selection after booking
          }));

          return newAppointment;
        } else {
          set({
            error: response.message || "Failed to book appointment",
            loading: false,
          });
          return null;
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
        set({
          error: "Failed to book appointment",
          loading: false,
        });
        return null;
      }
    },

    cancelAppointment: async (id: number) => {
      const state = get();
      if (state.loading) return false;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.cancel(id);

        if (response.success) {
          // Remove from appointments list
          set((state) => ({
            myAppointments: state.myAppointments.filter((apt) => apt.id !== id),
            appointments: state.appointments.filter((apt) => apt.id !== id),
            loading: false,
          }));
          return true;
        } else {
          set({
            error: response.message || "Failed to cancel appointment",
            loading: false,
          });
          return false;
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        set({
          error: "Failed to cancel appointment",
          loading: false,
        });
        return false;
      }
    },

    updateAppointmentStatus: async (
      id: number,
      status: Appointment["status"]
    ) => {
      const state = get();
      if (state.loading) return false;

      set({ loading: true, error: null });

      try {
        const response = await appointmentApi.updateStatus(id, status);

        if (response.success && response.data) {
          const updatedAppointment = response.data.appointment;

          // Update appointments list
          set((state) => ({
            myAppointments: state.myAppointments.map((apt) =>
              apt.id === id ? updatedAppointment : apt
            ),
            appointments: state.appointments.map((apt) =>
              apt.id === id ? updatedAppointment : apt
            ),
            loading: false,
          }));
          return true;
        } else {
          set({
            error: response.message || "Failed to update appointment status",
            loading: false,
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating appointment status:", error);
        set({
          error: "Failed to update appointment status",
          loading: false,
        });
        return false;
      }
    },

    // Utility actions
    clearError: () => set({ error: null }),
    reset: () =>
      set({
        loading: false,
        error: null,
        timeslots: [],
        timeslotsFetched: false,
        selectedStartDate: null,
        selectedEndDate: null,
        selectedTimeslot: null,
        appointments: [],
        myAppointments: [],
        appointmentsFetched: false,
        formData: initialFormData,
      }),
  })
);

// Convenience hooks
export const useTimeslots = () =>
  useAppointmentBookingStore((state) => state.timeslots);
export const useSelectedTimeslot = () =>
  useAppointmentBookingStore((state) => state.selectedTimeslot);
export const useSelectedStartDate = () =>
  useAppointmentBookingStore((state) => state.selectedStartDate);
export const useSelectedEndDate = () =>
  useAppointmentBookingStore((state) => state.selectedEndDate);
export const useMyAppointments = () =>
  useAppointmentBookingStore((state) => state.myAppointments);
export const useBookingFormData = () =>
  useAppointmentBookingStore((state) => state.formData);
export const useBookingLoading = () =>
  useAppointmentBookingStore((state) => state.loading);
export const useBookingError = () =>
  useAppointmentBookingStore((state) => state.error);
