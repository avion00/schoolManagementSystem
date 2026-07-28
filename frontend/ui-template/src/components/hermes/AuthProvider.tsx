import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { demoUsers, findUserByEmail, SESSION_KEY, type HermesUser, type Role } from "@/lib/hermes-auth";

type LoginResult = { ok: true } | { ok: false; reason: "bad_credentials" | "disabled" };

type AuthContextValue = {
  user: HermesUser | null;
  hydrated: boolean;
  login: (email: string, password: string, remember: boolean) => LoginResult;
  loginAs: (userId: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HermesUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
      if (raw) {
        const id = JSON.parse(raw) as string;
        const found = demoUsers.find((u) => u.id === id);
        if (found && found.active) setUser(found);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (u: HermesUser | null, remember = true) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u && remember) window.localStorage.setItem(SESSION_KEY, JSON.stringify(u.id));
    else window.localStorage.removeItem(SESSION_KEY);
  };

  const login: AuthContextValue["login"] = (email, password, remember) => {
    const u = findUserByEmail(email);
    if (!u || u.password !== password) return { ok: false, reason: "bad_credentials" };
    if (!u.active) return { ok: false, reason: "disabled" };
    persist(u, remember);
    return { ok: true };
  };

  const loginAs = (userId: string) => {
    const u = demoUsers.find((x) => x.id === userId);
    if (u && u.active) persist(u, true);
  };

  const logout = () => persist(null);

  const switchRole = (role: Role) => {
    // Prototype-only: swap to a demo user of the requested role.
    const target = demoUsers.find((u) => u.role === role && u.active);
    if (target) persist(target, true);
  };

  return (
    <AuthContext.Provider value={{ user, hydrated, login, loginAs, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
