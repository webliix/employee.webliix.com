import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../auth/AuthProvider";
import { usePermissions } from "../auth/usePermissions";
import { Forbidden403Page } from "./Forbidden403Page";

interface RequirePermissionProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
}

export function RequirePermission({
  permission,
  anyOf,
  allOf,
  children,
}: RequirePermissionProps) {
  const { loading, isAuthenticated } = useAuth();
  const { can, canAny, canAll } = usePermissions();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let authorized = true;

  if (permission) {
    authorized = authorized && can(permission);
  }

  if (anyOf && anyOf.length > 0) {
    authorized = authorized && canAny(anyOf);
  }

  if (allOf && allOf.length > 0) {
    authorized = authorized && canAll(allOf);
  }

  if (!authorized) {
    return <Forbidden403Page permission={permission} anyOf={anyOf} />;
  }

  return <>{children}</>;
}
