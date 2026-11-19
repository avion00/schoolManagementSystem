/** Help desk tickets: API access, mapping to the help desk view models, hooks. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StoredFile } from "./files";
import { get, getAll, post } from "./http";
import { fileSize } from "./notices";
import type {
  Assignee, Department, SlaStatus, SupportTicket, TicketAttachment, TicketCategory, TicketMessage,
  TicketPriority, TicketRequesterRole, TicketSource, TicketStatus,
} from "./types/helpdesk";

interface ApiUser { id: string; name: string; email: string; role: string }
export interface ApiTicket {
  id: string; code: string; requester: ApiUser; related_student: string | null; related_student_name: string | null;
  category: string; module: string; department: string; subject: string; description: string; priority: string;
  status: string; source: string; assignee: ApiUser | null; due_at: string | null; sla_status: string;
  first_response_at: string | null; resolved_at: string | null; closed_at: string | null; resolution_note: string;
  rating: number | null; attachments: StoredFile[]; created_at: string;
  messages?: { id: string; author: ApiUser | null; body: string; is_internal: boolean; attachments: StoredFile[]; created_at: string }[];
  events?: { id: string; action: string; detail: string; actor: string | null; created_at: string }[];
}

const invert = <T extends string>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<T, string>;

export const CATEGORY: Record<string, TicketCategory> = {
  student: "Student Issue", parent: "Parent Issue", teacher_complaint: "Teacher Complaint", staff_request: "Staff Request",
  attendance: "Attendance Problem", exam: "Exam / Result Problem", fees: "Fee / Payment Problem", library: "Library Issue",
  transport: "Transport Issue", hostel: "Hostel Issue", account: "Account/Login Issue", bug: "Technical Bug",
  data_correction: "Data Correction Request", emergency: "Emergency / Safety", other: "Other",
};
export const CATEGORY_VALUE = invert(CATEGORY);
export const STATUS: Record<string, TicketStatus> = {
  new: "New", open: "Open", in_progress: "In Progress", waiting_user: "Waiting for User",
  waiting_department: "Waiting for Department", escalated: "Escalated", resolved: "Resolved", closed: "Closed",
};
export const STATUS_VALUE = invert(STATUS);
export const PRIORITY_VALUE: Record<TicketPriority, string> = { Low: "low", Normal: "normal", High: "high", Urgent: "urgent" };
const SOURCE: Record<string, TicketSource> = {
  web: "Web Portal", mobile: "Mobile App", email: "Email", phone: "Phone Call", walk_in: "Walk-in Office", admin: "Admin Created",
};
export const SOURCE_VALUE = invert(SOURCE);
const DEPARTMENT: Record<string, Department> = {
  academics: "Academics", accounts: "Accounts", library: "Library", transport: "Transport", hostel: "Hostel",
  administration: "Administration", it: "IT",
};
export const DEPARTMENT_VALUE = invert(DEPARTMENT);
const SLA: Record<string, SlaStatus> = { on_track: "On Track", due_soon: "Due Soon", overdue: "Overdue", met: "Met", breached: "Breached" };
const SLA_TARGET: Record<string, string> = { urgent: "2 hours", high: "8 hours", normal: "24 hours", low: "48 hours" };
const ROLE: Record<string, TicketRequesterRole> = {
  student: "Student", parent: "Parent", teacher: "Teacher", principal: "Principal", admin: "Admin",
  super_admin: "Admin", staff: "Staff",
};

const EVENT_LABEL: Record<string, string> = {
  created: "Ticket created", assigned: "Assigned", replied: "Replied", resolved: "Resolved", closed: "Closed",
  reopened: "Reopened", rated: "Rated", note: "Internal note added",
};

function mapFile(f: StoredFile): TicketAttachment {
  return { id: f.id, name: f.original_name, size: fileSize(f.size), type: (f.kind ?? "file").toUpperCase(), downloadUrl: f.download_url };
}

export function mapTicket(t: ApiTicket): SupportTicket {
  const messages = (t.messages ?? []).map((m): TicketMessage => ({
    id: m.id, author: m.author?.name ?? "System", authorRole: ROLE[m.author?.role ?? ""] ?? "", body: m.body,
    isInternal: m.is_internal, timestamp: m.created_at, attachments: (m.attachments ?? []).map(mapFile),
  }));
  const lastEvent = (t.events ?? []).at(-1)?.created_at;
  return {
    id: t.id, ticketId: t.code,
    requester: {
      id: t.requester.id, name: t.requester.name, role: ROLE[t.requester.role] ?? "Staff", email: t.requester.email, phone: "",
      relatedChildName: t.related_student_name ?? undefined,
    },
    category: CATEGORY[t.category] ?? "Other", module: t.module ?? "", subject: t.subject, description: t.description,
    priority: ((t.priority ?? "normal").charAt(0).toUpperCase() + (t.priority ?? "normal").slice(1)) as TicketPriority,
    status: STATUS[t.status] ?? "Open", source: SOURCE[t.source] ?? "Web Portal",
    assignedTo: t.assignee ? { id: t.assignee.id, name: t.assignee.name, email: t.assignee.email } : null,
    sla: { status: SLA[t.sla_status] ?? "—", dueAt: t.due_at, responseTarget: SLA_TARGET[t.priority] ?? "" },
    relatedRecords: t.related_student ? [{ type: "Student", label: t.related_student_name ?? "Student", path: `/students/${t.related_student}` }] : [],
    attachments: (t.attachments ?? []).map(mapFile),
    messages: messages.filter((m) => !m.isInternal), internalNotes: messages.filter((m) => m.isInternal),
    activities: (t.events ?? []).map((e) => ({
      id: e.id, action: [EVENT_LABEL[e.action.split(":")[0]] ?? e.action.replace(/^status:/, "Status → ").replace(/_/g, " "), e.detail].filter(Boolean).join(" · "),
      by: e.actor ?? "", at: e.created_at,
    })),
    createdAt: t.created_at, updatedAt: lastEvent ?? t.created_at,
    resolutionSummary: t.resolution_note || undefined, department: DEPARTMENT[t.department] ?? "",
    rating: t.rating, relatedStudentId: t.related_student,
  };
}

export function useTickets(params?: { mine?: boolean }) {
  return useQuery({
    queryKey: ["helpdesk", "tickets", params?.mine ?? false],
    queryFn: async () => (await getAll<ApiTicket>("/helpdesk/tickets/", { mine: params?.mine ? 1 : undefined })).map(mapTicket)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    staleTime: 20_000,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["helpdesk", "ticket", id],
    queryFn: async () => mapTicket(await get<ApiTicket>(`/helpdesk/tickets/${id}/`)),
    enabled: !!id,
  });
}

export function useAgents(enabled = true) {
  return useQuery({
    queryKey: ["helpdesk", "agents"],
    queryFn: async () => (await get<ApiUser[]>("/helpdesk/tickets/agents/")).map((u): Assignee => ({ id: u.id, name: u.name, email: u.email })),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export interface HelpdeskStats {
  open: number; unassigned: number; overdue: number; by_status: Record<string, number>; by_priority: Record<string, number>;
  avg_first_response_hours: number | null; sla_met_pct: number | null; avg_rating: number | null;
}

export function useHelpdeskStats(enabled = true) {
  return useQuery({ queryKey: ["helpdesk", "stats"], queryFn: () => get<HelpdeskStats>("/helpdesk/tickets/stats/"), enabled, staleTime: 30_000 });
}

function useTicketMutation<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ["helpdesk"] }) });
}

export interface NewTicket {
  category: string; module?: string; department?: string; subject: string; description: string; priority: string;
  source?: string; related_student?: string | null; attachment_ids?: string[];
}

export function useCreateTicket() {
  return useTicketMutation((body: NewTicket) => post<ApiTicket>("/helpdesk/tickets/", body));
}

export function useTicketActions() {
  return {
    reply: useTicketMutation((v: { id: string; body: string; internal?: boolean; status?: string; attachmentIds?: string[] }) =>
      post(`/helpdesk/tickets/${v.id}/reply/`, { body: v.body, is_internal: !!v.internal, status: v.status, attachment_ids: v.attachmentIds ?? [] })),
    assign: useTicketMutation((v: { id: string; user: string }) => post(`/helpdesk/tickets/${v.id}/assign/`, { user: v.user })),
    setStatus: useTicketMutation((v: { id: string; status: string; priority?: string; note?: string }) =>
      post(`/helpdesk/tickets/${v.id}/set-status/`, { status: v.status, priority: v.priority, note: v.note })),
    resolve: useTicketMutation((v: { id: string; note: string }) => post(`/helpdesk/tickets/${v.id}/resolve/`, { note: v.note })),
    close: useTicketMutation((id: string) => post(`/helpdesk/tickets/${id}/close/`)),
    reopen: useTicketMutation((v: { id: string; reason: string }) => post(`/helpdesk/tickets/${v.id}/reopen/`, { reason: v.reason })),
    rate: useTicketMutation((v: { id: string; rating: number }) => post(`/helpdesk/tickets/${v.id}/rate/`, { rating: v.rating })),
  };
}
