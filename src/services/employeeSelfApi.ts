import { http } from "./http";
import type { EmployeeProfile } from "./authService";

export interface AttendanceRecord {
  id: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE" | "LATE";
  workingHours?: number;
}

export interface AttendanceStatusResponse {
  today: AttendanceRecord | null;
  status: "NOT_CLOCKED_IN" | "CLOCKED_IN" | "CLOCKED_OUT" | "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";
  recent: AttendanceRecord[];
}

export interface LeaveBalance {
  id: number;
  leaveType: "ANNUAL" | "CASUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID";
  allocationDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNotes?: string;
  createdAt: string;
}

export interface ApplyLeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface EmployeeDashboardData {
  profile: EmployeeProfile;
  permissions: string[];
  roles: string[];
  projectsCount: number;
  openTicketsCount: number;
  workLogsCount: number;
  todayAttendance: AttendanceRecord | null;
  todayAttendanceStatus: "NOT_CLOCKED_IN" | "CLOCKED_IN" | "CLOCKED_OUT" | "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";
  leaveBalances: LeaveBalance[];
}

export const employeeSelfApi = {
  async getDashboard(): Promise<EmployeeDashboardData> {
    const res = await http.get("/api/v1/employee/me/dashboard");
    return res.data?.data;
  },

  async getAttendance(): Promise<AttendanceStatusResponse> {
    const res = await http.get("/api/v1/employee/me/attendance");
    return res.data?.data;
  },

  async clockIn(): Promise<AttendanceRecord> {
    const res = await http.post("/api/v1/employee/me/attendance/clock-in", {});
    return res.data?.data;
  },

  async clockOut(): Promise<AttendanceRecord> {
    const res = await http.post("/api/v1/employee/me/attendance/clock-out", {});
    return res.data?.data;
  },

  async getLeaves(): Promise<LeaveRequest[]> {
    const res = await http.get("/api/v1/employee/me/leaves");
    return res.data?.data;
  },

  async applyLeave(data: ApplyLeaveRequest): Promise<LeaveRequest> {
    const res = await http.post("/api/v1/employee/me/leaves", data);
    return res.data?.data;
  },

  async getLeaveBalances(): Promise<LeaveBalance[]> {
    const res = await http.get("/api/v1/employee/me/leave-balances");
    return res.data?.data;
  },
};
