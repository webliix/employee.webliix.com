import { useAuth } from "./AuthProvider";
import type { ScopeType } from "../types/auth";

const SCOPE_RANKS: Record<ScopeType, number> = {
  OWN: 1,
  DEPARTMENT: 2,
  ALL: 3,
};

export function usePermissions() {
  const { permissions } = useAuth();

  const can = (code: string): boolean => {
    return permissions.has(code);
  };

  const canAny = (codes: string[]): boolean => {
    if (!codes || codes.length === 0) return true;
    return codes.some((code) => permissions.has(code));
  };

  const canAll = (codes: string[]): boolean => {
    if (!codes || codes.length === 0) return true;
    return codes.every((code) => permissions.has(code));
  };

  const scopeOf = (code: string): ScopeType | null => {
    return permissions.get(code) || null;
  };

  const hasScope = (code: string, requiredScope: ScopeType): boolean => {
    const currentScope = permissions.get(code);
    if (!currentScope) return false;
    return SCOPE_RANKS[currentScope] >= SCOPE_RANKS[requiredScope];
  };

  return {
    can,
    canAny,
    canAll,
    scopeOf,
    hasScope,
    permissions,
  };
}
