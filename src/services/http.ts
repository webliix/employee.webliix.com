import axios from "axios";

// Default to backend server; can be customized via VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://webliix-crm-backend.onrender.com";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Portal": "EMPLOYEE",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("employee_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401) {
      if (!url.includes("/auth/login")) {
        console.warn("Employee session expired or unauthorized:", url);
        localStorage.removeItem("employee_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      const data = error.response?.data || {};
      if (import.meta.env.DEV) {
        console.warn("[RBAC 403 Forbidden]", {
          url,
          code: data.code,
          requiredPermission: data.requiredPermission,
          message: data.message,
        });
      }
      // Dispatch event to show notification / toast
      window.dispatchEvent(
        new CustomEvent("webliix:notification", {
          detail: {
            type: "error",
            message: data.message || "You do not have permission for this action.",
          },
        })
      );
      // Dispatch event to refresh /auth/me permissions in background
      window.dispatchEvent(new CustomEvent("webliix:auth:refresh"));
    }

    return Promise.reject(error);
  }
);
