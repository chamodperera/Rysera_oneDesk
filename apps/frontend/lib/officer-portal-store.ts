import { create } from "zustand";
import {
  officerApi,
  appointmentApi,
  departmentApi,
  type Officer,
  type Appointment,
  type Department,
  type PaginationInfo,
} from "./api";

interface OfficerPortalState {
  // Loading states
  loading: boolean;
  error: string | null;

  // Officer profile
  officerProfile: Officer | null;
  profileLoading: boolean;

  // Department information
  department: Department | null;
  departmentLoading: boolean;

  // Appointments in department
  appointments: Appointment[];
  appointmentsPagination: PaginationInfo | null;
  appointmentsLoading: boolean;

  // Stats
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  } | null;
  statsLoading: boolean;

  // Actions
  fetchOfficerProfile: () => Promise<void>;
  fetchAppointments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => Promise<void>;
  updateAppointmentStatus: (
    appointmentId: number,
    status: Appointment["status"]
  ) => Promise<boolean>;
  assignSelfToAppointment: (appointmentId: number) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useOfficerPortalStore = create<OfficerPortalState>((set, get) => ({
  // Initial state
  loading: false,
  error: null,

  officerProfile: null,
  profileLoading: false,

  department: null,
  departmentLoading: false,

  appointments: [],
  appointmentsPagination: null,
  appointmentsLoading: false,

  stats: null,
  statsLoading: false,

  // Actions
  fetchOfficerProfile: async () => {
    set({ profileLoading: true, error: null });

    try {
      // Get officer profile
      const profileResponse = await officerApi.getMyProfile();

      if (profileResponse.success && profileResponse.data) {
        const officer = profileResponse.data.officer;
        set({ officerProfile: officer });

        // If officer has department, fetch department details
        if (officer.department_id) {
          set({ departmentLoading: true });
          const deptResponse = await departmentApi.getById(
            officer.department_id
          );

          if (deptResponse.success && deptResponse.data) {
            set({ department: deptResponse.data.department });
          }
          set({ departmentLoading: false });
        }
      } else {
        set({
          error: profileResponse.message || "Failed to fetch officer profile",
        });
      }
    } catch (error) {
      set({ error: "Failed to fetch officer profile" });
      console.error("Officer profile fetch error:", error);
    } finally {
      set({ profileLoading: false });
    }
  },

  fetchAppointments: async (params = {}) => {
    set({ appointmentsLoading: true, error: null });

    try {
      const { officerProfile } = get();

      // Get all appointments - don't restrict by department to avoid errors
      const response = await appointmentApi.getAll({
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status,
        search: params.search,
        date_from: params.date_from,
        date_to: params.date_to,
      });

      if (response.success && response.data) {
        let appointmentsToShow = response.data.data.appointments;

        // Only filter by department if officer has a department assigned
        // This prevents errors when officer doesn't have department or department assignment fails
        if (officerProfile?.department_id) {
          appointmentsToShow = response.data.data.appointments.filter(
            (appointment) =>
              appointment.service?.department_id ===
              officerProfile.department_id
          );
        }
        // If no department assigned, show all appointments (fallback behavior)

        set({
          appointments: appointmentsToShow,
          appointmentsPagination: response.data.data.pagination,
        });
      } else {
        set({ error: response.message || "Failed to fetch appointments" });
      }
    } catch (error) {
      set({ error: "Failed to fetch appointments" });
      console.error("Appointments fetch error:", error);
    } finally {
      set({ appointmentsLoading: false });
    }
  },

  updateAppointmentStatus: async (
    appointmentId: number,
    status: Appointment["status"]
  ) => {
    set({ loading: true, error: null });

    try {
      const response = await appointmentApi.updateStatus(appointmentId, status);

      if (response.success) {
        // Refresh appointments after status update
        await get().fetchAppointments();
        return true;
      } else {
        set({
          error: response.message || "Failed to update appointment status",
        });
        return false;
      }
    } catch (error) {
      set({ error: "Failed to update appointment status" });
      console.error("Status update error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  assignSelfToAppointment: async (appointmentId: number) => {
    set({ loading: true, error: null });

    try {
      const { officerProfile } = get();

      if (!officerProfile?.id) {
        set({ error: "Officer profile not loaded" });
        return false;
      }

      const response = await appointmentApi.assignOfficer(
        appointmentId,
        officerProfile.id
      );

      if (response.success) {
        // Refresh appointments after assignment
        await get().fetchAppointments();
        return true;
      } else {
        set({
          error: response.message || "Failed to assign officer to appointment",
        });
        return false;
      }
    } catch (error) {
      set({ error: "Failed to assign officer to appointment" });
      console.error("Officer assignment error:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true, error: null });

    try {
      const response = await appointmentApi.getStats();

      if (response.success && response.data) {
        set({ stats: response.data.data });
      } else {
        set({ error: response.message || "Failed to fetch stats" });
      }
    } catch (error) {
      set({ error: "Failed to fetch appointment stats" });
      console.error("Stats fetch error:", error);
    } finally {
      set({ statsLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
