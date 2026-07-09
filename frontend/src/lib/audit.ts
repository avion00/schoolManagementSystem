import { api } from "./api";
import type { Paginated } from "./students";

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string | null;
  actor_email: string | null;
  object_type: string;
  object_id: string;
  changes: Record<string, [unknown, unknown]>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export async function listAuditLogs(params: {
  search?: string;
  action?: string;
  actor?: string;
  page?: number;
}): Promise<Paginated<AuditLogEntry>> {
  const { data } = await api.get<Paginated<AuditLogEntry>>("/audit/logs/", { params });
  return data;
}
