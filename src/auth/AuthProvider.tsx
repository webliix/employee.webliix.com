import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { authService } from "../services/authService";
import type {
  AuthMeResponse,
  UserProfile,
  ScopeType,
  NavigationItem,
} from "../types/auth";

interface AuthContextType {
  user: UserProfile | null;
  permissions: Map<string, ScopeType>;
  navigation: NavigationItem[];
  portalAccess: string[];
  loading: boolean;
  refreshMe: () => Promise<AuthMeResponse | null>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; firstPath?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FOCUS_THROTTLE_MS = 60000; // 60s throttle for window focus refresh

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Map<string, ScopeType>>(
    new Map()
  );
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [portalAccess, setPortalAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const lastFetchTimeRef = useRef<number>(0);

  const applyAuthMe = useCallback((data: AuthMeResponse | null) => {
    if (!data) {
      setUser(null);
      setPermissions(new Map());
      setNavigation([]);
      setPortalAccess([]);
      return;
    }

    const u: UserProfile = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      jobTitle: data.jobTitle,
      department: data.department,
      bio: data.bio,
      timezone: data.timezone,
      language: data.language,
      twoFactorEnabled: data.twoFactorEnabled,
      enabled: data.enabled,
      emailVerified: data.emailVerified,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    setUser(u);

    const permMap = new Map<string, ScopeType>();
    if (Array.isArray(data.permissions)) {
      data.permissions.forEach((p) => {
        if (p && p.code) {
          permMap.set(p.code, p.scope || "OWN");
        }
      });
    }
    setPermissions(permMap);
    setNavigation(data.navigation || []);
    setPortalAccess(data.portalAccess || []);
  }, []);

  const refreshMe = useCallback(async (): Promise<AuthMeResponse | null> => {
    if (!authService.isAuthenticated()) {
      applyAuthMe(null);
      return null;
    }
    try {
      lastFetchTimeRef.current = Date.now();
      const me = await authService.getAuthMe();
      applyAuthMe(me);
      return me;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        authService.logout();
        applyAuthMe(null);
      }
      return null;
    }
  }, [applyAuthMe]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (authService.isAuthenticated()) {
        await refreshMe();
      }
      setLoading(false);
    };
    init();
  }, [refreshMe]);

  // Re-fetch on window focus (throttled 60s)
  useEffect(() => {
    const onFocus = () => {
      if (!authService.isAuthenticated()) return;
      const now = Date.now();
      if (now - lastFetchTimeRef.current >= FOCUS_THROTTLE_MS) {
        refreshMe();
      }
    };

    const onAuthRefreshEvent = () => {
      if (authService.isAuthenticated()) {
        refreshMe();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("webliix:auth:refresh", onAuthRefreshEvent);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("webliix:auth:refresh", onAuthRefreshEvent);
    };
  }, [refreshMe]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; firstPath?: string }> => {
    try {
      await authService.login(email, password);
      const me = await authService.getAuthMe();
      applyAuthMe(me);

      const hasEmployeePortal =
        me.portalAccess?.includes("EMPLOYEE_PORTAL_ACCESS") ||
        me.permissions?.some((p) => p.code === "EMPLOYEE_PORTAL_ACCESS");

      if (!hasEmployeePortal) {
        authService.logout();
        applyAuthMe(null);
        return {
          success: false,
          error: "You don't have access to the employee portal.",
        };
      }

      // Pick first navigation item if available, otherwise fallback
      let firstPath = "/dashboard";
      if (me.navigation && me.navigation.length > 0) {
        const first = me.navigation[0];
        firstPath = first.path || (first.children && first.children[0]?.path) || "/dashboard";
      }

      return { success: true, firstPath };
    } catch (err: any) {
      authService.logout();
      applyAuthMe(null);
      return {
        success: false,
        error:
          err?.response?.data?.message ||
          "Invalid email or password. Please try again.",
      };
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    applyAuthMe(null);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [applyAuthMe]);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        navigation,
        portalAccess,
        loading,
        refreshMe,
        login,
        logout,
        isAuthenticated: !!user && authService.isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
