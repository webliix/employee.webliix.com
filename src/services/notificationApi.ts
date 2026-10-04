import { http } from "./http";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  recipient: string;
  recipientType?: string;
  status: "PENDING" | "SENT" | "READ";
  channel?: string;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

export const notificationApi = {
  async getMyNotifications(): Promise<NotificationItem[]> {
    const res = await http.get("/api/v1/notifications");
    return res.data?.data || [];
  },

  async markAsRead(id: number): Promise<void> {
    await http.put(`/api/v1/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await http.put("/api/v1/notifications/read-all");
  },

  async getUnreadCount(): Promise<number> {
    const res = await http.get("/api/v1/notifications/unread-count");
    return res.data?.data || 0;
  },
};
