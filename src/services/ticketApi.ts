import { http } from "./http";

export interface TicketComment {
  id: number;
  ticketId: number;
  comment: string;
  commentedBy: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  category: string;
  dueDate?: string;
  customerName?: string;
  projectName?: string;
  createdAt: string;
}

export const ticketApi = {
  async getMyTickets(): Promise<Ticket[]> {
    const res = await http.get("/api/v1/employee/me/tickets");
    return res.data?.data || [];
  },

  async getTicket(id: number): Promise<Ticket> {
    const res = await http.get(`/api/v1/tickets/${id}`);
    return res.data?.data;
  },

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    const res = await http.put(`/api/v1/tickets/${id}`, data);
    return res.data?.data;
  },

  async getComments(ticketId: number): Promise<TicketComment[]> {
    const res = await http.get(`/api/v1/tickets/${ticketId}/comments`);
    return res.data?.data || [];
  },

  async addComment(ticketId: number, comment: string): Promise<TicketComment> {
    const res = await http.post(`/api/v1/tickets/${ticketId}/comments`, { comment });
    return res.data?.data;
  },
};
