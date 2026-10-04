import { http } from "./http";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  roles?: string[];
  permissions?: string[];
}

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
  async login(email: string, password: string):Promise<any> {
    const res = await http.post("/api/v1/auth/login", { email, password });
    const data = res.data?.data || res.data;
    if (data?.accessToken) {
      localStorage.setItem("employee_token", data.accessToken);
    }
    if (data?.user) {
      localStorage.setItem("employee_user", JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem("employee_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("employee_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    localStorage.removeItem("employee_token");
    localStorage.removeItem("employee_user");
  },

  async fetchMyEmployeeProfile(): Promise<EmployeeProfile> {
    const res = await http.get("/api/v1/employee/me");
    return res.data?.data;
  },
};
