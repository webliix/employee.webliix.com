import { http } from "./http";

export interface PaymentSubmission {
  id: number;
  employeeId: number;
  employeeName: string;
  projectId?: number;
  projectName?: string;
  customerId?: number;
  customerName?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  payerName?: string;
  receiverDetails?: string;
  notes?: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  linkedInvoiceId?: number;
  linkedInvoiceNumber?: string;
  createdAt: string;
}

export interface PaymentSubmissionRequest {
  projectId?: number;
  customerId?: number;
  amount: number;
  currency?: string;
  paymentDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  payerName?: string;
  receiverDetails?: string;
  notes?: string;
  linkedInvoiceId?: number;
}

export const paymentSubmissionApi = {
  async getMySubmissions(page = 0, size = 20): Promise<{ content: PaymentSubmission[]; totalElements: number }> {
    const res = await http.get(`/api/v1/employee/me/payment-submissions?page=${page}&size=${size}`);
    return res.data?.data || { content: [], totalElements: 0 };
  },

  async submitPayment(data: PaymentSubmissionRequest): Promise<PaymentSubmission> {
    const res = await http.post("/api/v1/employee/me/payment-submissions", data);
    return res.data?.data;
  },

  async deleteSubmission(id: number): Promise<void> {
    await http.delete(`/api/v1/payment-submissions/${id}`);
  },
};
