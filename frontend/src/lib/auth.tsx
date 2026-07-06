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
    (user.is_superuser || user.is_platform_admin || user.permissions.includes(code));

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
