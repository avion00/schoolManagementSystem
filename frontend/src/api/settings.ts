/** Organization settings (by section), the school profile and academic years. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, patch, post, type Schemas } from "./http";

export interface OrgSettings {
  notifications: { channels: Record<string, boolean>; events: Record<string, boolean> };
  attendance: { weekend_days: string[]; lock_after_days: number; [k: string]: unknown };
  security: { min_password_length: number; max_login_attempts: number; lockout_duration_mins: number; [k: string]: unknown };
  exams: Record<string, unknown>;
  appearance: Record<string, unknown>;
  fees: Record<string, unknown>;
}

export function useSettingsSection<K extends keyof OrgSettings>(section: K) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", section],
    queryFn: () => get<OrgSettings[K]>(`/settings/${section}/`),
    staleTime: 60_000,
  });
  const save = useMutation({
    mutationFn: (body: Partial<OrgSettings[K]>) => patch<OrgSettings[K]>(`/settings/${section}/`, body),
    onSuccess: (data) => qc.setQueryData(["settings", section], data),
  });
  return { query, save };
}

export type SchoolProfile = Schemas["SchoolProfile"];

export function useSchoolProfile() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["schools"], queryFn: () => get<SchoolProfile>("/settings/school/"), staleTime: 10 * 60_000 });
  const save = useMutation({
    mutationFn: (body: Partial<SchoolProfile> & { logo_id?: string | null }) => patch<SchoolProfile>("/settings/school/", body),
    onSuccess: (data) => qc.setQueryData(["schools"], data),
  });
  return { query, save };
}

export function useAcademicYears() {
  const qc = useQueryClient();
  const done = () => { qc.invalidateQueries({ queryKey: ["settings", "years"] }); qc.invalidateQueries({ queryKey: ["academics"] }); };
  const query = useQuery({
    queryKey: ["settings", "years"],
    queryFn: async () => (await getAll<Schemas["AcademicYear"]>("/academics/academic-years/"))
      .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? "")),
  });
  return {
    query,
    create: useMutation({ mutationFn: (body: { school: string; name: string; start_date: string; end_date: string; is_current?: boolean }) =>
      post("/academics/academic-years/", body), onSuccess: done }),
    update: useMutation({ mutationFn: (v: { id: string; body: Record<string, unknown> }) =>
      patch(`/academics/academic-years/${v.id}/`, v.body), onSuccess: done }),
    remove: useMutation({ mutationFn: (id: string) => del(`/academics/academic-years/${id}/`), onSuccess: done }),
  };
}

// ── my account ───────────────────────────────────────────────────────────────

export interface Me {
  id: string; email: string; full_name: string; phone: string; timezone: string; language: string;
  password_changed_at: string | null; last_login: string | null; roles: string[];
  organization: { name: string } | null; is_platform_admin: boolean;
}

export function useMe() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["auth", "me", "full"], queryFn: () => get<Me>("/auth/me/") });
  const save = useMutation({
    mutationFn: (body: Partial<Pick<Me, "full_name" | "phone" | "timezone" | "language">>) => patch<Me>("/auth/me/", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["auth"] }); qc.invalidateQueries({ queryKey: ["me"] }); },
  });
  return { query, save };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (v: { current_password: string; new_password: string; sign_out_other_sessions: boolean }) =>
      post<{ detail: string; other_sessions_revoked: number }>("/auth/change-password/", v),
  });
}

export interface Session { id: string; user_agent: string; ip_address: string | null; created_at: string; last_used_at: string | null; is_current: boolean }

export function useSessions() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
  return {
    query: useQuery({ queryKey: ["auth", "sessions"], queryFn: () => get<Session[]>("/auth/sessions/") }),
    revoke: useMutation({ mutationFn: (id: string) => del(`/auth/sessions/${id}/`), onSuccess: done }),
    revokeOthers: useMutation({ mutationFn: () => post<{ revoked: number }>("/auth/sessions/revoke-others/"), onSuccess: done }),
  };
}

/** "Chrome on macOS" from a user-agent string. */
export function deviceLabel(ua: string): string {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android"
    : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}
