import { type ReactNode } from "react";
import { usePermissions } from "../auth/usePermissions";
import type { ScopeType } from "../types/auth";

interface CanProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  scope?: ScopeType;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({
  permission,
  anyOf,
  allOf,
  scope,
  fallback = null,
  children,
}: CanProps) {
  const { can, canAny, canAll, hasScope } = usePermissions();

  let allowed = true;

  if (permission) {
    allowed = allowed && can(permission);
    if (allowed && scope) {
      allowed = allowed && hasScope(permission, scope);
    }
  }

  if (anyOf && anyOf.length > 0) {
    allowed = allowed && canAny(anyOf);
  }

  if (allOf && allOf.length > 0) {
    allowed = allowed && canAll(allOf);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
