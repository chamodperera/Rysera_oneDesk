// API service layer for OneDesk backend integration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Types for API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role?: "citizen" | "officer" | "admin";
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: "citizen" | "officer" | "admin";
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  contact_info: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  department_id: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  department?: {
    id: number;
    name: string;
    description: string;
    contact_info: string;
  };
}

export interface Timeslot {
  id: number;
  service_id: number;
  slot_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  capacity: number;
  slots_available: number;
  created_at: string;
  updated_at: string;
  service?: {
    id?: number;
    name: string;
    description?: string;
    department?: {
      name: string;
      description: string;
    };
  };
}

export interface Appointment {
  id: number;
  user_id: number;
  service_id: number;
  timeslot_id: number;
  officer_id?: number;
  booking_no: number;
  booking_reference: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  qr_code?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  service?: {
    id: number;
    name: string;
    department_id: number;
    duration_minutes: number;
  };
  timeslot?: {
    id: number;
    slot_date: string;
    start_time: string;
    end_time: string;
  };
  officer?: {
    id: number;
    user_id: number;
    position: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface BookAppointmentRequest {
  user_id: number;
  service_id: number;
  timeslot_id: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TimeslotResponse {
  timeslots: Timeslot[];
  pagination: PaginationInfo;
}

export interface AppointmentResponse {
  appointments: Appointment[];
  pagination: PaginationInfo;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Document {
  id: number;
  appointment_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface Officer {
  id: number;
  user_id: number;
  department_id: number;
  position: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
  };
  department?: {
    id: number;
    name: string;
    description: string;
    contact_info: string;
  };
}

export interface CreateOfficerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  department_id: number;
  position?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: "citizen" | "officer" | "admin";
}

// Token management
export class TokenManager {
  private static readonly TOKEN_KEY = "onedesk_token";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// HTTP client with error handling
class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...TokenManager.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(
    endpoint: string,
    data: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async put<T>(
    endpoint: string,
    data: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Authentication API functions
export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    if (response.success && response.data?.token) {
      TokenManager.setToken(response.data.token);
    }

    return response;
  },

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>(
      "/auth/register",
      userData
    );

    if (response.success && response.data?.token) {
      TokenManager.setToken(response.data.token);
    }

    return response;
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return ApiClient.get<{ user: User }>("/auth/profile");
  },

  async updateProfile(
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    return ApiClient.put<{ user: User }>("/auth/profile", userData);
  },

  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post("/auth/change-password", data);
  },

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.post("/auth/reset-password", data);
  },

  logout(): void {
    TokenManager.removeToken();
  },
};

// Health check
export const healthApi = {
  async check(): Promise<ApiResponse<{ status: string; service: string }>> {
    return ApiClient.get("/health");
  },
};

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Department API
export const departmentApi = {
  async getAll(): Promise<
    ApiResponse<{ departments: Department[]; pagination: PaginationInfo }>
  > {
    return ApiClient.get<{
      departments: Department[];
      pagination: PaginationInfo;
    }>("/departments");
  },

  async getById(id: number): Promise<ApiResponse<{ department: Department }>> {
    return ApiClient.get<{ department: Department }>(`/departments/${id}`);
  },

  async create(
    departmentData: Omit<Department, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<{ department: Department }>> {
    return ApiClient.post<{ department: Department }>(
      "/departments",
      departmentData
    );
  },

  async update(
    id: number,
    departmentData: Partial<
      Omit<Department, "id" | "created_at" | "updated_at">
    >
  ): Promise<ApiResponse<{ department: Department }>> {
    return ApiClient.put<{ department: Department }>(
      `/departments/${id}`,
      departmentData
    );
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/departments/${id}`);
  },
};

// Service API
export const serviceApi = {
  async getAll(): Promise<
    ApiResponse<{ services: Service[]; pagination: PaginationInfo }>
  > {
    return ApiClient.get<{ services: Service[]; pagination: PaginationInfo }>(
      "/services"
    );
  },

  async getById(id: number): Promise<ApiResponse<{ service: Service }>> {
    return ApiClient.get<{ service: Service }>(`/services/${id}`);
  },

  async getByDepartment(departmentId: number): Promise<
    ApiResponse<{
      services: Service[];
      department: { id: number; name: string };
    }>
  > {
    return ApiClient.get<{
      services: Service[];
      department: { id: number; name: string };
    }>(`/services/department/${departmentId}`);
  },

  async search(query: string): Promise<
    ApiResponse<{
      services: Service[];
      search_query: string;
      department_id?: number;
    }>
  > {
    return ApiClient.get<{
      services: Service[];
      search_query: string;
      department_id?: number;
    }>(`/services/search?q=${encodeURIComponent(query)}`);
  },

  async create(
    serviceData: Omit<
      Service,
      "id" | "created_at" | "updated_at" | "department"
    >
  ): Promise<ApiResponse<{ service: Service }>> {
    return ApiClient.post<{ service: Service }>("/services", serviceData);
  },

  async update(
    id: number,
    serviceData: Partial<
      Omit<Service, "id" | "created_at" | "updated_at" | "department">
    >
  ): Promise<ApiResponse<{ service: Service }>> {
    return ApiClient.put<{ service: Service }>(`/services/${id}`, serviceData);
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/services/${id}`);
  },
};

// Timeslot API
export const timeslotApi = {
  async getAll(): Promise<ApiResponse<{ data: TimeslotResponse }>> {
    return ApiClient.get<{ data: TimeslotResponse }>("/timeslots");
  },

  async getById(id: number): Promise<ApiResponse<{ timeslot: Timeslot }>> {
    return ApiClient.get<{ timeslot: Timeslot }>(`/timeslots/${id}`);
  },

  async getByService(
    serviceId: number
  ): Promise<ApiResponse<{ data: { timeslots: Timeslot[] } }>> {
    return ApiClient.get<{ data: { timeslots: Timeslot[] } }>(
      `/timeslots/service/${serviceId}`
    );
  },

  async getAvailableByService(
    serviceId: number
  ): Promise<ApiResponse<{ data: { timeslots: Timeslot[] } }>> {
    return ApiClient.get<{ data: { timeslots: Timeslot[] } }>(
      `/timeslots/service/${serviceId}/available`
    );
  },

  async search(params: {
    fromDate?: string;
    toDate?: string;
    serviceIds?: number[];
    availableOnly?: boolean;
  }): Promise<
    ApiResponse<{ timeslots: Timeslot[]; search_criteria?: object }>
  > {
    const queryParams = new URLSearchParams();
    if (params.fromDate) queryParams.append("from_date", params.fromDate);
    if (params.toDate) queryParams.append("to_date", params.toDate);
    if (params.serviceIds && params.serviceIds.length > 0) {
      queryParams.append("service_ids", params.serviceIds.join(","));
    }
    if (params.availableOnly !== undefined) {
      queryParams.append("available_only", params.availableOnly.toString());
    }

    return ApiClient.get<{
      timeslots: Timeslot[];
      search_criteria?: object;
    }>(`/timeslots/search?${queryParams}`);
  },

  async create(
    timeslotData: Omit<Timeslot, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<{ timeslot: Timeslot }>> {
    return ApiClient.post<{ timeslot: Timeslot }>("/timeslots", timeslotData);
  },

  async update(
    id: number,
    timeslotData: Partial<Omit<Timeslot, "id" | "created_at" | "updated_at">>
  ): Promise<ApiResponse<{ timeslot: Timeslot }>> {
    return ApiClient.put<{ timeslot: Timeslot }>(
      `/timeslots/${id}`,
      timeslotData
    );
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/timeslots/${id}`);
  },

  async book(
    id: number,
    bookingData: { user_id: number }
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.put<{ appointment: Appointment }>(
      `/timeslots/${id}/book`,
      bookingData
    );
  },

  async release(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.put<{ message: string }>(`/timeslots/${id}/release`, {});
  },
};

// Appointment API
export const appointmentApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    service_id?: number;
    user_id?: number;
    officer_id?: number;
  }): Promise<ApiResponse<{ data: AppointmentResponse }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.service_id)
      queryParams.append("service_id", params.service_id.toString());
    if (params?.user_id)
      queryParams.append("user_id", params.user_id.toString());
    if (params?.officer_id)
      queryParams.append("officer_id", params.officer_id.toString());

    const url = queryParams.toString()
      ? `/appointments?${queryParams}`
      : "/appointments";
    return ApiClient.get<{ data: AppointmentResponse }>(url);
  },

  async getMy(): Promise<ApiResponse<{ appointments: Appointment[] }>> {
    return ApiClient.get<{ appointments: Appointment[] }>("/appointments/my");
  },

  async getById(
    id: number
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.get<{ appointment: Appointment }>(`/appointments/${id}`);
  },

  async getByBookingRef(
    bookingRef: string
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.get<{ appointment: Appointment }>(
      `/appointments/booking/${bookingRef}`
    );
  },

  async create(
    appointmentData: BookAppointmentRequest
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.post<{ appointment: Appointment }>(
      "/appointments",
      appointmentData
    );
  },

  async updateStatus(
    id: number,
    status: Appointment["status"]
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.put<{ appointment: Appointment }>(
      `/appointments/${id}/status`,
      { status }
    );
  },

  async assignOfficer(
    id: number,
    officerId: number
  ): Promise<ApiResponse<{ appointment: Appointment }>> {
    return ApiClient.put<{ appointment: Appointment }>(
      `/appointments/${id}/officer`,
      { officer_id: officerId }
    );
  },

  async cancel(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/appointments/${id}`);
  },

  async getStats(): Promise<
    ApiResponse<{
      data: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
      };
    }>
  > {
    return ApiClient.get<{
      data: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
      };
    }>("/appointments/stats");
  },
};

// Admin API
export const adminApi = {
  // User management
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<
    ApiResponse<{
      users: User[];
      pagination: PaginationInfo;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    return ApiClient.get<{
      users: User[];
      pagination: PaginationInfo;
    }>(`/users?${queryParams}`);
  },

  async getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
    return ApiClient.get<{ user: User }>(`/users/${id}`);
  },

  async createUser(
    userData: CreateUserRequest
  ): Promise<ApiResponse<{ user: User; token?: string }>> {
    return ApiClient.post<{ user: User; token?: string }>(
      "/auth/admin/register",
      userData
    );
  },

  async updateUser(
    id: number,
    userData: Partial<CreateUserRequest>
  ): Promise<ApiResponse<{ user: User }>> {
    return ApiClient.put<{ user: User }>(`/users/${id}`, userData);
  },

  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/users/${id}`);
  },

  async getUsersByRole(role: string): Promise<ApiResponse<{ users: User[] }>> {
    return ApiClient.get<{ users: User[] }>(`/users/role/${role}`);
  },

  // Officer management
  async createOfficer(officerData: CreateOfficerRequest): Promise<
    ApiResponse<{
      user: User;
      officer: Officer;
      token?: string;
    }>
  > {
    // First create the user account
    const userResponse = await this.createUser({
      first_name: officerData.first_name,
      last_name: officerData.last_name,
      email: officerData.email,
      phone_number: officerData.phone_number,
      password: officerData.password,
      role: "officer",
    });

    if (!userResponse.success || !userResponse.data) {
      return {
        success: false,
        message: userResponse.message || "Failed to create user account",
        error: userResponse.error,
      };
    }

    // Then create the officer profile
    const officerResponse = await officerApi.create({
      user_id: userResponse.data.user.id,
      department_id: officerData.department_id,
      position: officerData.position || null,
    });

    if (!officerResponse.success || !officerResponse.data) {
      // If officer creation fails, we should ideally delete the user account
      // For now, just return the error
      return {
        success: false,
        message: officerResponse.message || "Failed to create officer profile",
        error: officerResponse.error,
      };
    }

    return {
      success: true,
      data: {
        user: userResponse.data.user,
        officer: officerResponse.data.officer,
        token: userResponse.data.token,
      },
      message: "Officer created successfully",
    };
  },
};

// Officer API
export const officerApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: number;
    position?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<
    ApiResponse<{
      officers: Officer[];
      pagination: PaginationInfo;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.department_id)
      queryParams.append("department_id", params.department_id.toString());
    if (params?.position) queryParams.append("position", params.position);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    return ApiClient.get<{
      officers: Officer[];
      pagination: PaginationInfo;
    }>(`/officers?${queryParams}`);
  },

  async getById(id: number): Promise<ApiResponse<{ officer: Officer }>> {
    return ApiClient.get<{ officer: Officer }>(`/officers/${id}`);
  },

  async getByDepartment(
    departmentId: number
  ): Promise<ApiResponse<{ officers: Officer[] }>> {
    return ApiClient.get<{ officers: Officer[] }>(
      `/officers/department/${departmentId}`
    );
  },

  async search(query: string): Promise<ApiResponse<{ officers: Officer[] }>> {
    return ApiClient.get<{ officers: Officer[] }>(
      `/officers/search?q=${encodeURIComponent(query)}`
    );
  },

  async getAvailableForService(
    serviceId: number
  ): Promise<ApiResponse<{ officers: Officer[] }>> {
    return ApiClient.get<{ officers: Officer[] }>(
      `/officers/service/${serviceId}/available`
    );
  },

  async getMyProfile(): Promise<ApiResponse<{ officer: Officer }>> {
    return ApiClient.get<{ officer: Officer }>("/officers/profile/me");
  },

  async create(officerData: {
    user_id: number;
    department_id: number;
    position: string | null;
  }): Promise<ApiResponse<{ officer: Officer }>> {
    return ApiClient.post<{ officer: Officer }>("/officers", officerData);
  },

  async update(
    id: number,
    officerData: Partial<{
      department_id: number;
      position: string;
    }>
  ): Promise<ApiResponse<{ officer: Officer }>> {
    return ApiClient.put<{ officer: Officer }>(`/officers/${id}`, officerData);
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    return ApiClient.delete(`/officers/${id}`);
  },
};

// Document API
export const documentApi = {
  async uploadDocument(
    appointmentId: number,
    file: File,
    documentType: string,
    comments?: string
  ): Promise<
    ApiResponse<{
      id: number;
      appointment_id: number;
      file_name: string;
      document_type: string;
      status: string;
      uploaded_at: string;
      comments?: string;
    }>
  > {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("appointment_id", appointmentId.toString());
    formData.append("document_type", documentType);
    if (comments) {
      formData.append("comments", comments);
    }

    const token = TokenManager.getToken();
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  },

  async getAppointmentDocuments(
    appointmentId: number
  ): Promise<ApiResponse<Document[]>> {
    return ApiClient.get<Document[]>(`/documents/appointment/${appointmentId}`);
  },

  async downloadDocument(documentId: number): Promise<
    ApiResponse<{
      document_id: number;
      file_name: string;
      download_url: string;
      expires_at: string;
    }>
  > {
    return ApiClient.get<{
      document_id: number;
      file_name: string;
      download_url: string;
      expires_at: string;
    }>(`/documents/download/${documentId}`);
  },

  async getMyDocuments(): Promise<ApiResponse<Document[]>> {
    return ApiClient.get<Document[]>("/documents/my-documents");
  },
};
