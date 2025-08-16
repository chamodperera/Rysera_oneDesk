import { create } from "zustand";
import {
  adminApi,
  officerApi,
  departmentApi,
  type User,
  type Officer,
  type Department,
  type CreateOfficerRequest,
  type CreateUserRequest,
  type PaginationInfo,
} from "./api";

interface AdminState {
  // Loading states
  loading: boolean;
  error: string | null;

  // Users management
  users: User[];
  usersPagination: PaginationInfo | null;
  usersLoading: boolean;
  selectedUser: User | null;

  // Officers management
  officers: Officer[];
  officersPagination: PaginationInfo | null;
  officersLoading: boolean;
  selectedOfficer: Officer | null;

  // Departments for dropdowns
  departments: Department[];
  departmentsLoading: boolean;

  // Actions
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => Promise<void>;

  fetchOfficers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: number;
    position?: string;
    sort_by?: string;
    sort_order?: string;
  }) => Promise<void>;

  fetchDepartments: () => Promise<void>;

  createUser: (userData: CreateUserRequest) => Promise<boolean>;
  updateUser: (
    id: number,
    userData: Partial<CreateUserRequest>
  ) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;

  createOfficer: (officerData: CreateOfficerRequest) => Promise<boolean>;
  updateOfficer: (
    id: number,
    officerData: Partial<{ department_id: number; position: string }>
  ) => Promise<boolean>;
  deleteOfficer: (id: number) => Promise<boolean>;

  setSelectedUser: (user: User | null) => void;
  setSelectedOfficer: (officer: Officer | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  loading: false,
  error: null,

  users: [],
  usersPagination: null,
  usersLoading: false,
  selectedUser: null,

  officers: [],
  officersPagination: null,
  officersLoading: false,
  selectedOfficer: null,

  departments: [],
  departmentsLoading: false,

  // Actions
  fetchUsers: async (params) => {
    set({ usersLoading: true, error: null });

    try {
      const response = await adminApi.getAllUsers(params);

      if (response.success && response.data) {
        set({
          users: response.data.users,
          usersPagination: response.data.pagination,
          usersLoading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch users",
          usersLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        error: "Failed to fetch users",
        usersLoading: false,
      });
    }
  },

  fetchOfficers: async (params) => {
    set({ officersLoading: true, error: null });

    try {
      const response = await officerApi.getAll(params);

      if (response.success && response.data) {
        set({
          officers: response.data.officers,
          officersPagination: response.data.pagination,
          officersLoading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch officers",
          officersLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      set({
        error: "Failed to fetch officers",
        officersLoading: false,
      });
    }
  },

  fetchDepartments: async () => {
    set({ departmentsLoading: true, error: null });

    try {
      const response = await departmentApi.getAll();

      if (response.success && response.data) {
        set({
          departments: response.data.departments,
          departmentsLoading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch departments",
          departmentsLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      set({
        error: "Failed to fetch departments",
        departmentsLoading: false,
      });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });

    try {
      const response = await adminApi.createUser(userData);

      if (response.success && response.data) {
        // Refresh users list
        const { fetchUsers } = get();
        await fetchUsers();
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to create user",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      set({
        error: "Failed to create user",
        loading: false,
      });
      return false;
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null });

    try {
      const response = await adminApi.updateUser(id, userData);

      if (response.success) {
        // Refresh users list
        const { fetchUsers } = get();
        await fetchUsers();
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to update user",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      set({
        error: "Failed to update user",
        loading: false,
      });
      return false;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });

    try {
      const response = await adminApi.deleteUser(id);

      if (response.success) {
        // Remove from local state
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          loading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || "Failed to delete user",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      set({
        error: "Failed to delete user",
        loading: false,
      });
      return false;
    }
  },

  createOfficer: async (officerData) => {
    set({ loading: true, error: null });

    try {
      const response = await adminApi.createOfficer(officerData);

      if (response.success && response.data) {
        // Refresh both users and officers lists
        const { fetchUsers, fetchOfficers } = get();
        await Promise.all([fetchUsers(), fetchOfficers()]);
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to create officer",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating officer:", error);
      set({
        error: "Failed to create officer",
        loading: false,
      });
      return false;
    }
  },

  updateOfficer: async (id, officerData) => {
    set({ loading: true, error: null });

    try {
      const response = await officerApi.update(id, officerData);

      if (response.success) {
        // Refresh officers list
        const { fetchOfficers } = get();
        await fetchOfficers();
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to update officer",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating officer:", error);
      set({
        error: "Failed to update officer",
        loading: false,
      });
      return false;
    }
  },

  deleteOfficer: async (id) => {
    set({ loading: true, error: null });

    try {
      const response = await officerApi.delete(id);

      if (response.success) {
        // Remove from local state
        set((state) => ({
          officers: state.officers.filter((officer) => officer.id !== id),
          loading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || "Failed to delete officer",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting officer:", error);
      set({
        error: "Failed to delete officer",
        loading: false,
      });
      return false;
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
  setSelectedOfficer: (officer) => set({ selectedOfficer: officer }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      loading: false,
      error: null,
      users: [],
      usersPagination: null,
      usersLoading: false,
      selectedUser: null,
      officers: [],
      officersPagination: null,
      officersLoading: false,
      selectedOfficer: null,
      departments: [],
      departmentsLoading: false,
    }),
}));
