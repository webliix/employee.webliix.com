import axios from "axios";

// Default to backend server; can be customized via VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://webliix-crm-backend.onrender.com";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login")) {
        console.warn("Employee session expired or unauthorized:", url);
        localStorage.removeItem("employee_token");
        localStorage.removeItem("employee_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
