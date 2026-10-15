export type ScopeType = "OWN" | "DEPARTMENT" | "ALL";

export interface UserPermissionItem {
  code: string;
  scope: ScopeType;
}

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon: string;
  module: string;
  requiredPermission?: string;
  sortOrder?: number;
  parentKey?: string | null;
  children?: NavigationItem[];
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  enabled?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthMeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  enabled?: boolean;
  emailVerified?: boolean;
  user?: UserProfile;
  roles?: string[]; // Backend serialization compatibility only; never checked in client logic
  permissions: UserPermissionItem[];
  navigation: NavigationItem[];
  portalAccess: string[];
  createdAt?: string;
  updatedAt?: string;
}
