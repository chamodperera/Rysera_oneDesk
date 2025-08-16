"use client";

import { create } from "zustand";
import { departmentApi, serviceApi, Department, Service } from "./api";

interface DepartmentServiceState {
  // State
  departments: Department[];
  services: Service[];
  allServices: Service[]; // Cache for all services
  loading: boolean;
  error: string | null;

  // Cache flags to prevent re-fetching
  departmentsFetched: boolean;
  allServicesFetched: boolean;

  // Actions
  fetchDepartments: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchServicesByDepartment: (departmentId: number) => Promise<void>;
  searchServices: (query: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDepartmentServiceStore = create<DepartmentServiceState>()(
  (set, get) => ({
    // Initial state
    departments: [],
    services: [],
    allServices: [],
    loading: false,
    error: null,
    departmentsFetched: false,
    allServicesFetched: false,

    // Actions
    fetchDepartments: async () => {
      const state = get();
      if (state.departmentsFetched && state.departments.length > 0) {
        return; // Don't fetch if already fetched
      }

      set({ loading: true, error: null });
      try {
        const response = await departmentApi.getAll();
        if (response.success && response.data) {
          set({
            departments: response.data.departments, // Extract from data.departments
            loading: false,
            departmentsFetched: true,
          });
        } else {
          set({ error: response.message, loading: false });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch departments",
          loading: false,
        });
      }
    },

    fetchServices: async () => {
      const state = get();
      if (state.allServicesFetched && state.allServices.length > 0) {
        // Return cached all services
        set({ services: state.allServices, loading: false });
        return;
      }

      set({ loading: true, error: null });
      try {
        const response = await serviceApi.getAll();
        if (response.success && response.data) {
          set({
            services: response.data.services,
            allServices: response.data.services,
            loading: false,
            allServicesFetched: true,
          });
        } else {
          set({ error: response.message, loading: false });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch services",
          loading: false,
        });
      }
    },

    fetchServicesByDepartment: async (departmentId: number) => {
      set({ loading: true, error: null });
      try {
        const response = await serviceApi.getByDepartment(departmentId);
        if (response.success && response.data) {
          set({ services: response.data.services, loading: false });
        } else {
          set({ error: response.message, loading: false });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch services",
          loading: false,
        });
      }
    },

    searchServices: async (query: string) => {
      if (!query.trim()) {
        // If empty query, fetch all services
        get().fetchServices();
        return;
      }

      set({ loading: true, error: null });
      try {
        const response = await serviceApi.search(query);
        if (response.success && response.data) {
          set({ services: response.data.services, loading: false });
        } else {
          set({ error: response.message, loading: false });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to search services",
          loading: false,
        });
      }
    },

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        departments: [],
        services: [],
        allServices: [],
        loading: false,
        error: null,
        departmentsFetched: false,
        allServicesFetched: false,
      }),
  })
);

// Convenience hooks for easier usage
export const useDepartments = () => {
  const { departments, loading, error, fetchDepartments } =
    useDepartmentServiceStore();
  return { departments, loading, error, fetchDepartments };
};

export const useServices = () => {
  const {
    services,
    loading,
    error,
    fetchServices,
    fetchServicesByDepartment,
    searchServices,
  } = useDepartmentServiceStore();
  return {
    services,
    loading,
    error,
    fetchServices,
    fetchServicesByDepartment,
    searchServices,
  };
};
