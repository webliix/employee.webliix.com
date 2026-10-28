/**
 * Employee Portal WebSocket & STOMP Service
 * Connects to Webliix Spring Boot STOMP broker for real-time ticket assignments,
 * customer chat replies, and system notifications.
 */

type MessageHandler = (data: any) => void;

class EmployeeWebSocketService {
  private socket: WebSocket | null = null;
  private isConnectedFlag: boolean = false;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private employeeId?: number;
  private employeeEmail?: string;
  private ticketListeners: Set<MessageHandler> = new Set();
  private notificationListeners: Set<MessageHandler> = new Set();
  private subscriptionIdCounter: number = 0;
  private activeSubscriptions: Map<string, string> = new Map(); // topic -> subId

  public connect(employeeId?: number, email?: string) {
    if (employeeId) this.employeeId = employeeId;
    if (email) this.employeeEmail = email;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const isHttps = window.location.protocol === "https:";
      const protocol = isHttps ? "wss:" : "ws:";
      const host = window.location.host;
      
      // Try native websocket endpoint first, compatible with Spring Boot @EnableWebSocketMessageBroker
      const wsUrl = `${protocol}//${host}/ws/websocket`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.sendStompConnect();
      };

      this.socket.onmessage = (event) => {
        this.handleStompMessage(event.data);
      };

      this.socket.onclose = () => {
        this.isConnectedFlag = false;
        this.clearHeartbeat();
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn("[EmployeeWS] WebSocket encountered error:", err);
      };
    } catch (e) {
      console.warn("[EmployeeWS] Connection initialization error:", e);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearHeartbeat();
    this.activeSubscriptions.clear();
    this.isConnectedFlag = false;

    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send("DISCONNECT\n\n\0");
        }
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.isConnectedFlag;
  }

  public onTicketUpdate(callback: MessageHandler): () => void {
    this.ticketListeners.add(callback);
    return () => {
      this.ticketListeners.delete(callback);
    };
  }

  public onNotification(callback: MessageHandler): () => void {
    this.notificationListeners.add(callback);
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  private sendStompConnect() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const connectFrame = "CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\n\n\0";
    this.socket.send(connectFrame);
  }

  private subscribe(destination: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.isConnectedFlag) return;
    if (this.activeSubscriptions.has(destination)) return;

    const subId = `sub-${this.subscriptionIdCounter++}`;
    this.activeSubscriptions.set(destination, subId);

    const subFrame = `SUBSCRIBE\nid:${subId}\ndestination:${destination}\nack:auto\n\n\0`;
    this.socket.send(subFrame);
  }

  private setupAllSubscriptions() {
    this.activeSubscriptions.clear();

    // General channels
    this.subscribe("/topic/tickets");
    this.subscribe("/topic/notifications");

    // Employee specific channels
    if (this.employeeId) {
      this.subscribe(`/topic/employee/${this.employeeId}/tickets`);
      this.subscribe(`/topic/notifications/${this.employeeId}`);
    }

    if (this.employeeEmail) {
      const cleanEmail = this.employeeEmail.trim().toLowerCase();
      this.subscribe(`/topic/employee/${cleanEmail}/tickets`);
      this.subscribe(`/topic/notifications/${cleanEmail}`);
    }
  }

  private handleStompMessage(rawData: string) {
    if (typeof rawData !== "string") return;

    // Heartbeat incoming
    if (rawData === "\n" || rawData === "\r\n") {
      return;
    }

    // Handle STOMP frames
    if (rawData.startsWith("CONNECTED")) {
      this.isConnectedFlag = true;
      this.startHeartbeat();
      this.setupAllSubscriptions();
      return;
    }

    if (rawData.startsWith("MESSAGE")) {
      const bodyIndex = rawData.indexOf("\n\n");
      const altBodyIndex = rawData.indexOf("\r\n\r\n");
      const splitIdx = bodyIndex !== -1 ? bodyIndex + 2 : (altBodyIndex !== -1 ? altBodyIndex + 4 : -1);

      let payload = rawData;
      if (splitIdx !== -1) {
        payload = rawData.substring(splitIdx).replace(/\0$/, "").trim();
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(payload);
      } catch {
        parsed = { raw: payload };
      }

      const isTicketMessage =
        rawData.includes("destination:/topic/tickets") ||
        rawData.includes("/tickets") ||
        parsed?.ticketId !== undefined ||
        parsed?.ticketNumber !== undefined;

      if (isTicketMessage) {
        this.ticketListeners.forEach((fn) => {
          try {
            fn(parsed);
          } catch (e) {
            console.error("Ticket listener error:", e);
          }
        });
      }

      this.notificationListeners.forEach((fn) => {
        try {
          fn(parsed);
        } catch (e) {
          console.error("Notification listener error:", e);
        }
      });
    }
  }

  private startHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send("\n");
      }
    }, 10000);
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isConnectedFlag) {
        this.connect();
      }
    }, 5000);
  }
}

export const employeeWebSocketService = new EmployeeWebSocketService();
