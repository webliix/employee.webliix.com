import { http } from "./http";

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignedTo?: number;
  startDate?: string;
  dueDate?: string;
}

export interface ProjectWorkLog {
  id: number;
  employeeId?: number;
  employeeName?: string;
  employeeCode?: string;
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
  status: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface ProjectComment {
  id: number;
  projectId: number;
  authorName: string;
  comment: string;
  message?: string;
  createdAt: string;
}

export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  progressPercentage?: number;
  customer?: {
    id: number;
    companyName: string;
    contactPerson: string;
    email: string;
  };
}

export interface ProjectInvoiceItem {
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface BillProjectRequest {
  customerId?: number;
  projectId?: number;
  issueDate?: string;
  dueDate?: string;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  items: ProjectInvoiceItem[];
}

export interface ProjectBillingSummary {
  projectId: number;
  projectCode: string;
  projectName: string;
  customerId: number;
  customerName: string;
  customerCompanyName: string;
  budget: number;
  totalBilled: number;
  totalPaid: number;
  pendingDueOnInvoices: number;
  remainingProjectBalance: number;
  unbilledContractAmount: number;
  invoices: any[];
  paymentSubmissions: any[];
}

export const projectApi = {
  async getMyProjects(): Promise<Project[]> {
    const res = await http.get("/api/v1/employee/me/projects");
    return res.data?.data || [];
  },

  async getProject(id: number): Promise<Project> {
    const res = await http.get(`/api/v1/projects/${id}`);
    return res.data?.data;
  },

  async getProjectBilling(projectId: number): Promise<ProjectBillingSummary | null> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/billing`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  async billProject(projectId: number, payload: BillProjectRequest) {
    const res = await http.post(`/api/v1/employee/me/projects/${projectId}/bill`, payload);
    return res.data;
  },

  async getProjectTasks(projectId: number): Promise<ProjectTask[]> {
    const res = await http.get(`/api/v1/projects/${projectId}/tasks`);
    return res.data?.data || [];
  },

  async updateTaskStatus(projectId: number, taskId: number, task: Partial<ProjectTask>): Promise<ProjectTask> {
    const res = await http.put(`/api/v1/projects/${projectId}/tasks/${taskId}`, task);
    return res.data?.data;
  },

  async getProjectComments(projectId: number): Promise<ProjectComment[]> {
    const res = await http.get(`/api/v1/projects/${projectId}/comments`);
    const list = res.data?.data || [];
    return list.map((c: any) => {
      const msg = c.comment || c.message || c.text || c.content || c.note || "";
      return {
        ...c,
        comment: msg,
        message: msg,
      };
    });
  },

  async addProjectComment(projectId: number, comment: string): Promise<ProjectComment> {
    const res = await http.post(`/api/v1/projects/${projectId}/comments`, { message: comment, comment });
    const c = res.data?.data || {};
    return {
      ...c,
      comment: c.comment || c.message || comment,
      message: c.message || c.comment || comment,
    };
  },

  async updateProjectProgress(
    projectId: number,
    progressPercentage?: number,
    status?: string,
    updateNote?: string
  ): Promise<Project> {
    const params: Record<string, any> = {};
    if (progressPercentage !== undefined) params.progressPercentage = progressPercentage;
    if (status) params.status = status;
    if (updateNote) params.updateNote = updateNote;
    const res = await http.patch(`/api/v1/projects/${projectId}/progress`, null, { params });
    return res.data?.data;
  },

  async createProjectTask(
    projectId: number,
    task: { title: string; description?: string; status?: string; dueDate?: string; assignedTo?: number }
  ): Promise<ProjectTask> {
    const res = await http.post(`/api/v1/projects/${projectId}/tasks`, task);
    return res.data?.data;
  },

  async getProjectWorkLogs(projectId: number): Promise<ProjectWorkLog[]> {
    const res = await http.get(`/api/v1/projects/${projectId}/work-logs`);
    return res.data?.data || [];
  },
};


