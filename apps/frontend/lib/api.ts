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

export interface AuthResponse {
  user: User;
  token: string;
}

// Token management
class TokenManager {
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
    data: Record<string, unknown> | LoginRequest | RegisterRequest
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async put<T>(
    endpoint: string,
    data: Record<string, unknown> | Partial<User>
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

export { TokenManager };
