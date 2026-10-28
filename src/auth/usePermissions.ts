import { useCallback } from "react";
import { useAuth } from "./AuthProvider";
import type { ScopeType } from "../types/auth";

const SCOPE_RANKS: Record<ScopeType, number> = {
  OWN: 1,
  DEPARTMENT: 2,
  ALL: 3,
};

export function usePermissions() {
  const { permissions } = useAuth();

  const can = useCallback((code: string): boolean => {
    return permissions.has(code);
  }, [permissions]);

  const canAny = useCallback((codes: string[]): boolean => {
    if (!codes || codes.length === 0) return true;
    return codes.some((code) => permissions.has(code));
  }, [permissions]);

  const canAll = useCallback((codes: string[]): boolean => {
    if (!codes || codes.length === 0) return true;
    return codes.every((code) => permissions.has(code));
  }, [permissions]);

  const scopeOf = useCallback((code: string): ScopeType | null => {
    return permissions.get(code) || null;
  }, [permissions]);

  const hasScope = useCallback((code: string, requiredScope: ScopeType): boolean => {
    const currentScope = permissions.get(code);
    if (!currentScope) return false;
    return SCOPE_RANKS[currentScope] >= SCOPE_RANKS[requiredScope];
  }, [permissions]);

  return {
    can,
    canAny,
    canAll,
    scopeOf,
    hasScope,
    permissions,
  };
}
