import { http } from "./http";

export interface WorkLog {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  logDate: string;
  workSummary: string;
  hoursWorked?: number;
  workUnits?: number;
  workCost?: number;
  projectId?: number;
  projectName?: string;
  taskId?: number;
  taskTitle?: string;
  tasksCompleted?: string;
  blockers?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLogRequest {
  logDate: string;
  workSummary: string;
  hoursWorked?: number;
  workUnits?: number;
  workCost?: number;
  projectId?: number;
  taskId?: number;
  tasksCompleted?: string;
  blockers?: string;
}

export const workLogApi = {
  async getMyWorkLogs(page = 0, size = 20): Promise<{ content: WorkLog[]; totalElements: number }> {
    const res = await http.get(`/api/v1/employee/me/work-logs?page=${page}&size=${size}`);
    return res.data?.data || { content: [], totalElements: 0 };
  },

  async submitWorkLog(data: WorkLogRequest): Promise<WorkLog> {
    const res = await http.post("/api/v1/employee/me/work-logs", data);
    return res.data?.data;
  },

  async updateWorkLog(id: number, data: WorkLogRequest): Promise<WorkLog> {
    const res = await http.put(`/api/v1/employee/me/work-logs/${id}`, data);
    return res.data?.data;
  },

  async getWorkLogsByRange(from: string, to: string): Promise<WorkLog[]> {
    const res = await http.get(`/api/v1/employee/me/work-logs/range?from=${from}&to=${to}`);
    return res.data?.data || [];
  },
};
