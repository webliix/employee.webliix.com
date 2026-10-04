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

export const projectApi = {
  async getMyProjects(): Promise<Project[]> {
    const res = await http.get("/api/v1/employee/me/projects");
    return res.data?.data || [];
  },

  async getProject(id: number): Promise<Project> {
    const res = await http.get(`/api/v1/projects/${id}`);
    return res.data?.data;
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

