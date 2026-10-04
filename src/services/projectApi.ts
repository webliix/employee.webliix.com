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

export interface ProjectComment {
  id: number;
  projectId: number;
  authorName: string;
  comment: string;
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
    return res.data?.data || [];
  },

  async addProjectComment(projectId: number, comment: string): Promise<ProjectComment> {
    const res = await http.post(`/api/v1/projects/${projectId}/comments`, { message: comment });
    return res.data?.data;
  },
};


