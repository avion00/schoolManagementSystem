import { api } from "./api";
import type { Paginated } from "./students";

export interface DashboardSummary {
  students: number;
  teachers: number;
  attendance_today_pct: number | null;
  attendance_marked_today: number;
  fee_collected_this_month: number;
  outstanding_dues: number;
  recent_activity: {
    action: string;
    actor__email: string | null;
    object_type: string;
    created_at: string;
  }[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary/");
  return data;
}

export interface DashboardAnalytics {
  fees_series: { date: string; amount: number }[];
  fees_week: { day: string; amount: number }[];
  attendance_series: { day: string; pct: number }[];
  fees_change_pct: number | null;
  students_change_pct: number | null;
  recent_students: {
    id: string;
    name: string;
    admission_number: string;
    class_level: string;
    section: string;
    status: string;
  }[];
  recent_invoices: {
    id: string;
    student: string;
    number: string;
    amount: number;
    status: string;
  }[];
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const { data } = await api.get<DashboardAnalytics>("/dashboard/analytics/");
  return data;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export async function listUsers(params: { search?: string; page?: number }) {
  const { data } = await api.get<Paginated<AdminUser>>("/users/", { params });
  return data;
}

export interface CreateUserInput {
  email: string;
  full_name: string;
  password: string;
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/users/", input);
  return data;
}

export async function deactivateUser(id: string): Promise<void> {
  await api.delete(`/users/${id}/`);
}

export async function activateUser(id: string): Promise<void> {
  await api.post(`/users/${id}/activate/`);
}

export async function resetUserPassword(id: string): Promise<{ temporary_password: string }> {
  const { data } = await api.post(`/users/${id}/reset-password/`);
  return data;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: string[];
}

export async function listRoles(): Promise<Role[]> {
  const { data } = await api.get<Paginated<Role>>("/rbac/roles/", {
    params: { page_size: 200 },
  });
  return data.results;
}

export async function assignRole(userId: string, roleId: string): Promise<void> {
  await api.post("/rbac/user-roles/", { user: userId, role: roleId });
}
