/**
 * Self-service portals (/me/...): students, guardians (their children) and
 * teachers. Each endpoint is scoped by the server to the signed-in person.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StoredFile } from "./files";
import { get, getAll, post } from "./http";

// ── shared shapes ────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string; full_name: string; first_name: string; last_name: string; date_of_birth: string | null; gender: string;
  blood_group: string; address: string; phone: string; email: string; admission_number: string;
  registration_number: string; roll_number: string; class_level_name: string; section_name: string;
  academic_year_name: string; guardian_name: string; status: string;
}
export interface AttendanceTotals { total: number; by_status: Record<string, number>; present_pct: number | null }
export interface FeeTotals { billed: number; paid: number; outstanding: number }
export interface SubjectResult {
  exam_subject: string; subject: string; full_marks: number; pass_marks: number; marks_obtained: number | null;
  is_absent: boolean; percentage: number | null; grade: string | null; grade_point: number | null; result: string;
}
export interface ExamResultRow {
  exam_id: string; exam: string; is_published: boolean; subjects: SubjectResult[]; obtained: number; full: number;
  percentage: number | null; grade: string | null; gpa: number | null; result: string; rank: number | null; section_rank: number | null;
}
export interface Period {
  id: string; day: string; period: string; period_no: number; label: string; start_time: string; end_time: string;
  is_break: boolean; subject: string; subject_id: string; teacher: string | null; room: string | null; section: string;
  status: string; notes: string; state?: "past" | "now" | "next" | "later" | string;
}
export type WeekTimetable = Record<string, Period[]>;
export interface InvoiceRow {
  id: string; number: string; billing_period: string; issue_date: string; due_date: string | null; total_amount: string;
  discount_amount: string; net_amount: string; paid_amount: string; balance: string; status: string;
  items: { description: string; amount: string }[];
}
export interface AttendanceRow { id: string; date: string; status: string; remark: string }
export interface PortalAssignment {
  id: string; title: string; kind: string; instructions: string; subject_name: string; teacher_name: string;
  due_at: string | null; max_marks: string | null; allow_late: boolean; status: string; attachments: StoredFile[];
  class_level_name: string; section_name: string | null;
  /** pending | submitted | late | graded | missing (from the server) */
  my_status: string;
  my_submission: { id: string; text_answer: string; attachments: StoredFile[]; submitted_at: string; is_late: boolean; status: string;
    marks: string | null; feedback: string } | null;
}
export interface PortalMaterial {
  id: string; title: string; description: string; subject_name: string; teacher_name: string | null; file: StoredFile | null;
  url: string; type: string; created_at: string;
}

const me = (path: string) => `/me/${path}`;

// ── student ──────────────────────────────────────────────────────────────────

export function useMyDashboard() {
  return useQuery({
    queryKey: ["portal", "dashboard"],
    queryFn: () => get<{ profile: StudentProfile; attendance: AttendanceTotals; fees: FeeTotals; latest_result?: ExamResultRow | null; published_exams?: number }>(me("dashboard/")),
  });
}
export const useMyToday = () => useQuery({ queryKey: ["portal", "today"], queryFn: () => get<{ day: string; date: string; periods: Period[] }>(me("today/")) });
export const useMyTimetable = () => useQuery({ queryKey: ["portal", "timetable"], queryFn: () => get<WeekTimetable>(me("timetable/")) });
export const useMyResults = () => useQuery({ queryKey: ["portal", "results"], queryFn: () => get<ExamResultRow[]>(me("results/")) });
export const useMyFees = () => useQuery({ queryKey: ["portal", "fees"], queryFn: () => get<{ summary: FeeTotals; invoices: InvoiceRow[] }>(me("fees/")) });
export const useMyAttendanceSummary = () => useQuery({ queryKey: ["portal", "attendance", "summary"], queryFn: () => get<AttendanceTotals>(me("attendance/summary/")) });
export const useMyAttendance = () => useQuery({ queryKey: ["portal", "attendance"], queryFn: () => getAll<AttendanceRow>(me("attendance/")) });
export const useMyAssignments = () => useQuery({ queryKey: ["portal", "assignments"], queryFn: () => get<PortalAssignment[]>(me("assignments/")) });
export const useMyMaterials = () => useQuery({ queryKey: ["portal", "materials"], queryFn: () => get<PortalMaterial[]>(me("materials/")) });

export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; text: string; attachmentIds: string[] }) =>
      post(me(`assignments/${v.id}/submit/`), { text_answer: v.text, attachment_ids: v.attachmentIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal", "assignments"] }),
  });
}

// ── guardian ─────────────────────────────────────────────────────────────────

export interface Child {
  id: string; full_name: string; gender: string; admission_number: string; roll_number: string; class_level_name: string;
  section_name: string; academic_year_name: string; status: string; relation: string; attendance_pct: number | null;
  outstanding_fees: number; latest_result_pct: number | null; published_exams: number;
}
export const useChildren = () => useQuery({ queryKey: ["portal", "children"], queryFn: () => get<Child[]>(me("children/")) });
const child = (id: string, path = "") => me(`children/${id}/${path}`);
export function useChild(id: string | undefined) {
  return useQuery({
    queryKey: ["portal", "child", id],
    queryFn: () => get<{ profile: StudentProfile; attendance: AttendanceTotals; fees: FeeTotals; published_exams: number; latest_result: ExamResultRow | null }>(child(id!)),
    enabled: !!id,
  });
}
export const useChildAttendance = (id?: string) => useQuery({ queryKey: ["portal", "child", id, "attendance"], queryFn: () => getAll<AttendanceRow>(child(id!, "attendance/")), enabled: !!id });
export const useChildResults = (id?: string) => useQuery({ queryKey: ["portal", "child", id, "results"], queryFn: () => get<ExamResultRow[]>(child(id!, "results/")), enabled: !!id });
export const useChildFees = (id?: string) => useQuery({ queryKey: ["portal", "child", id, "fees"], queryFn: () => get<{ summary: FeeTotals; invoices: InvoiceRow[] }>(child(id!, "fees/")), enabled: !!id });
export const useChildAssignments = (id?: string) => useQuery({ queryKey: ["portal", "child", id, "assignments"], queryFn: () => get<PortalAssignment[]>(child(id!, "assignments/")), enabled: !!id });
export const useChildTimetable = (id?: string) => useQuery({ queryKey: ["portal", "child", id, "timetable"], queryFn: () => get<WeekTimetable>(child(id!, "timetable/")), enabled: !!id });

// ── teacher ──────────────────────────────────────────────────────────────────

export interface TeacherClass {
  assignment: string; class_level: string; class_level_name: string; section: string | null; section_name: string | null;
  subject: string | null; subject_name: string | null; is_class_teacher: boolean; students: number;
  attendance_rate_30d: number | null; attendance_marked_today: number; attendance_complete_today: boolean; pending_marks: number;
}
export interface ClassStudent {
  id: string; name: string; admission_number: string; roll_number: string; section_name: string; gender: string; status: string;
  attendance_pct: number | null; guardian_name: string; guardian_phone: string; guardian_email: string;
}
export const useTeacherDashboard = () => useQuery({ queryKey: ["portal", "teacher", "dashboard"], queryFn: () => get<{ profile: Record<string, unknown>; classes: TeacherClass[]; [k: string]: unknown }>(me("teacher/dashboard/")) });
export const useTeacherToday = () => useQuery({ queryKey: ["portal", "teacher", "today"], queryFn: () => get<{ day: string; date: string; periods: Period[] }>(me("teacher/today/")) });
export const useTeacherTimetable = () => useQuery({ queryKey: ["portal", "teacher", "timetable"], queryFn: () => get<WeekTimetable>(me("teacher/timetable/")) });
export const useMyClasses = (enabled = true) => useQuery({ queryKey: ["portal", "teacher", "classes"], queryFn: () => get<TeacherClass[]>(me("teacher/classes/")), enabled });
export const useClassStudents = (assignmentId?: string) => useQuery({
  queryKey: ["portal", "teacher", "class", assignmentId], queryFn: () => get<ClassStudent[]>(me(`teacher/classes/${assignmentId}/students/`)), enabled: !!assignmentId,
});
export const useMyPayslips = () => useQuery({ queryKey: ["portal", "teacher", "payslips"], queryFn: () => get<Record<string, unknown>[]>(me("teacher/payslips/")) });
export const useMyStaffAttendance = () => useQuery({ queryKey: ["portal", "teacher", "attendance"], queryFn: () => getAll<AttendanceRow>(me("teacher/attendance/")) });
export const useMyStaffAttendanceSummary = () => useQuery({ queryKey: ["portal", "teacher", "attendance", "summary"], queryFn: () => get<Record<string, number | null>>(me("teacher/attendance/summary/")) });

export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
