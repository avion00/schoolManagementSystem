import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  region: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_platform_admin: boolean;
  is_superuser: boolean;
  is_student: boolean;
  organization: Organization | null;
  roles: string[];
  permissions: string[];
}

async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me/");
  return data;
}

/**
 * Roles that get the same school-management nav access as a platform
 * admin. Principal already carries every real RBAC permission code
 * server-side (see backend seed_demo.py ROLE_PERMISSIONS — "everything"),
 * but a handful of nav items are gated behind the "superuser" sentinel,
 * which only `is_superuser`/`is_platform_admin` can ever satisfy. This
 * bridges that one frontend-only gap — it does not grant anything beyond
 * what a real permission code would (message moderation/export/settings
 * use their own distinct codes and stay correctly restricted).
 */
const SCHOOL_ADMIN_ROLES = ["Principal"];
export function isSchoolAdminRole(roles: string[]) {
  return SCHOOL_ADMIN_ROLES.some((r) => roles.includes(r));
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      api.post("/auth/login/", vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } finally {
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
    }
  };

  const hasPermission = (code: string) =>
    !!user &&
    (user.is_superuser ||
      user.is_platform_admin ||
      (code === "superuser" && isSchoolAdminRole(user.roles)) ||
      user.permissions.includes(code));

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
