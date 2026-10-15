import { http } from "./http";
import type { AuthMeResponse, UserProfile } from "../types/auth";
export type { UserProfile } from "../types/auth";

export interface EmployeeProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentName?: string;
  designationName?: string;
  joiningDate?: string;
  employmentType?: string;
  active?: boolean;
  userId?: number;
}

export const authService = {
  async login(email: string, password: string): Promise<any> {
    const res = await http.post("/api/v1/auth/login", { email, password });
    const data = res.data?.data || res.data;
    if (data?.accessToken) {
      localStorage.setItem("employee_token", data.accessToken);
    }
    // employee_user is intentionally not stored here; GET /api/v1/auth/me is the single source of truth
    return data;
  },

  async getAuthMe(): Promise<AuthMeResponse> {
    const res = await http.get("/api/v1/auth/me");
    return res.data?.data;
  },

  getToken(): string | null {
    return localStorage.getItem("employee_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    localStorage.removeItem("employee_token");
  },

  async fetchMyEmployeeProfile(): Promise<EmployeeProfile> {
    const res = await http.get("/api/v1/employee/me");
    return res.data?.data;
  },
};
