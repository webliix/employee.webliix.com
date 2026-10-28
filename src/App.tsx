import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import GlobalStyles from "@mui/material/GlobalStyles";
import { AuthProvider } from "./auth/AuthProvider";
import { EmployeeLayout } from "./layouts/EmployeeLayout";
import { EmployeeLoginPage } from "./pages/EmployeeLoginPage";
import { RequirePermission } from "./components/RequirePermission";
import { NotFound404Page } from "./components/NotFound404Page";
import { routeRegistry } from "./routes/registry";

function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <CircularProgress size={36} />
    </Box>
  );
}

export function App() {
  return (
    <AuthProvider>
      <GlobalStyles
        styles={{
          "*": {
            scrollbarWidth: "none !important",
            msOverflowStyle: "none !important",
          },
          "*::-webkit-scrollbar": {
            display: "none !important",
            width: "0px !important",
            height: "0px !important",
          },
          "html, body, #root": {
            scrollbarWidth: "none !important",
            msOverflowStyle: "none !important",
          },
        }}
      />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<EmployeeLoginPage />} />

            {Object.values(routeRegistry).map((route) => {
              const Component = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RequirePermission
                      permission={route.permission}
                      anyOf={route.anyOf}
                    >
                      <EmployeeLayout>
                        <Component />
                      </EmployeeLayout>
                    </RequirePermission>
                  }
                />
              );
            })}

            {/* Root redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 handler for unknown paths */}
            <Route
              path="*"
              element={
                <RequirePermission anyOf={["EMPLOYEE_PORTAL_ACCESS", "DASHBOARD_VIEW"]}>
                  <EmployeeLayout>
                    <NotFound404Page />
                  </EmployeeLayout>
                </RequirePermission>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
