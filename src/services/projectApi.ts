import { http } from "./http";

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  taskName?: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | string;
  priority?: string;
  assignedTo?: string | number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
}

export interface ProjectMilestoneItem {
  id: number;
  projectId: number;
  title: string;
  milestoneName?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  completedAt?: string;
  status?: string;
}

export interface ProjectMemberItem {
  id: number;
  projectId: number;
  userId?: number;
  employeeId?: number;
  employeeName?: string;
  employeeEmail?: string;
  employeeCode?: string;
  designationName?: string;
  departmentName?: string;
  roleInProject: string;
  assignedDate?: string;
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
  budget?: number;
  documentationUrl?: string;
  architectureNotes?: string;
  customerName?: string;
  customerEmail?: string;
  customerCompanyName?: string;
  createdAt?: string;
  updatedAt?: string;
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

  async getProject(id: number | string): Promise<Project> {
    const res = await http.get(`/api/v1/projects/${id}`);
    return res.data?.data;
  },

  async getMilestones(projectId: number | string): Promise<ProjectMilestoneItem[]> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/milestones`);
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async updateMilestone(
    projectId: number | string,
    milestoneId: number | string,
    payload: { title?: string; description?: string; dueDate?: string; completed?: boolean }
  ): Promise<ProjectMilestoneItem | null> {
    try {
      const res = await http.put(`/api/v1/projects/${projectId}/milestones/${milestoneId}`, payload);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async addMilestone(
    projectId: number | string,
    payload: { title: string; description?: string; dueDate?: string }
  ): Promise<ProjectMilestoneItem | null> {
    try {
      const res = await http.post(`/api/v1/projects/${projectId}/milestones`, payload);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async getProjectMembers(projectId: number | string): Promise<ProjectMemberItem[]> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/members`);
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async getProjectBilling(projectId: number | string): Promise<ProjectBillingSummary | null> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/billing`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  async billProject(projectId: number | string, payload: BillProjectRequest) {
    const res = await http.post(`/api/v1/employee/me/projects/${projectId}/bill`, payload);
    return res.data;
  },

  async getProjectTasks(projectId: number | string): Promise<ProjectTask[]> {
    const res = await http.get(`/api/v1/projects/${projectId}/tasks`);
    return res.data?.data || [];
  },

  async updateTaskStatus(projectId: number | string, taskId: number | string, task: Partial<ProjectTask>): Promise<ProjectTask> {
    const res = await http.put(`/api/v1/projects/${projectId}/tasks/${taskId}`, task);
    return res.data?.data;
  },

  async getProjectComments(projectId: number | string): Promise<ProjectComment[]> {
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

  async addProjectComment(projectId: number | string, comment: string): Promise<ProjectComment> {
    const res = await http.post(`/api/v1/projects/${projectId}/comments`, { message: comment, comment });
    const c = res.data?.data || {};
    return {
      ...c,
      comment: c.comment || c.message || comment,
      message: c.message || c.comment || comment,
    };
  },

  async updateProjectProgress(
    projectId: number | string,
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
    projectId: number | string,
    task: { title: string; description?: string; status?: string; dueDate?: string; assignedTo?: number | string }
  ): Promise<ProjectTask> {
    const res = await http.post(`/api/v1/projects/${projectId}/tasks`, task);
    return res.data?.data;
  },

  async getProjectWorkLogs(projectId: number | string): Promise<ProjectWorkLog[]> {
    const res = await http.get(`/api/v1/projects/${projectId}/work-logs`);
    return res.data?.data || [];
  },
};


