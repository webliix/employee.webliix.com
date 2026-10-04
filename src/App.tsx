import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { authService } from "./services/authService";
import { EmployeeLayout } from "./layouts/EmployeeLayout";
import { EmployeeLoginPage } from "./pages/EmployeeLoginPage";
import { EmployeeDashboardPage } from "./pages/EmployeeDashboardPage";
import { EmployeeProjectsPage } from "./pages/EmployeeProjectsPage";
import { EmployeeWorkLogsPage } from "./pages/EmployeeWorkLogsPage";
import { EmployeeTicketsPage } from "./pages/EmployeeTicketsPage";
import { EmployeePaymentsPage } from "./pages/EmployeePaymentsPage";
import { EmployeeNotificationsPage } from "./pages/EmployeeNotificationsPage";
import { EmployeeProfilePage } from "./pages/EmployeeProfilePage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <EmployeeLayout>{children}</EmployeeLayout>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<EmployeeLoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EmployeeDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <EmployeeProjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-logs"
          element={
            <ProtectedRoute>
              <EmployeeWorkLogsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <EmployeeTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <EmployeePaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <EmployeeNotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <EmployeeProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
