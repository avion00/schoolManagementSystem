/**
 * Attendance: registers, monthly sheets, reports, stats — students and staff.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { get, getAll, post, type Schemas } from "./http";
import type {
  AttendanceStats, AttendanceStatus, ClassComparison, Holiday, MonthlyAttendance, MonthlyTrendPoint, StudentRef,
  TeacherMonthlyAttendance, TeacherRef,
} from "./types/attendance";

export const toStatus = (s: string | null | undefined): AttendanceStatus | undefined =>
  s ? ((s === "half_day" ? "half-day" : s) as AttendanceStatus) : undefined;
export const fromStatus = (s: AttendanceStatus): string => (s === "half-day" ? "half_day" : s);

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Not a weekend (per school settings) and not inside a holiday. */
export function isWorkingDay(year: number, month: number, day: number, holidays: Holiday[], weekendDays: string[]): boolean {
  const d = new Date(year, month - 1, day);
  if (weekendDays.includes(DAY_NAMES[d.getDay()])) return false;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return !holidays.some((h) => h.date === iso);
}

export function useWeekendDays() {
  return useQuery({
    queryKey: ["settings", "attendance"],
    queryFn: () => get<{ weekend_days: string[] }>("/settings/attendance/"),
    staleTime: 10 * 60_000,
    select: (d) => d.weekend_days,
  });
}

// ── stats / trends / comparison ─────────────────────────────────────────────

export function useAttendanceStats() {
  return useQuery({
    queryKey: ["attendance", "stats"],
    queryFn: async () => {
      const s = await get<{
        date: string; today: Record<string, number>; monthly_rate: number | null; weekly_change: number | null;
        monthly_trend: { month: string; rate: number | null }[];
      }>("/attendance/stats/");
      const stats: AttendanceStats = {
        todayPresent: s.today.present ?? 0, todayAbsent: s.today.absent ?? 0, todayLate: s.today.late ?? 0,
        todayLeave: s.today.leave ?? 0, todayHalfDay: s.today.half_day ?? 0,
        monthlyRate: s.monthly_rate, weeklyTrend: s.weekly_change,
      };
      const trend: MonthlyTrendPoint[] = s.monthly_trend.map((t) => ({
        month: new Date(`${t.month}-01`).toLocaleDateString("en", { month: "short" }), presentRate: t.rate,
      }));
      return { date: s.date, stats, trend };
    },
    staleTime: 60_000,
  });
}

export function useClassComparison(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["attendance", "classes", dateFrom, dateTo],
    queryFn: async () => {
      const r = await get<{ rows: { class_level_name: string; section_name: string | null; students: number; rate: number | null }[] }>(
        "/attendance/class-report/", { date_from: dateFrom, date_to: dateTo });
      return r.rows.map((x): ClassComparison => ({
        className: x.class_level_name, section: x.section_name ?? "—", students: x.students, rate: x.rate,
      }));
    },
    staleTime: 60_000,
  });
}

export interface StudentSummaryRow {
  id: string; name: string; admissionNo: string; rollNo: string; className: string; section: string;
  marked: number; present: number; absent: number; late: number; rate: number;
}

/** Per-student totals over a range plus the school-wide status split. */
export function useStudentSummary(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["attendance", "student-summary", dateFrom, dateTo],
    queryFn: async () => {
      const r = await get<{
        by_status: Record<string, number>;
        rows: { student: string; name: string; admission_no: string; roll_number: string; class_level_name: string;
                section_name: string; marked: number; present: number; absent: number; late: number; rate: number }[];
      }>("/attendance/student-summary/", { date_from: dateFrom, date_to: dateTo });
      const byStatus: Partial<Record<AttendanceStatus, number>> = {};
      for (const [k, v] of Object.entries(r.by_status)) {
        const st = toStatus(k);
        if (st) byStatus[st] = (byStatus[st] ?? 0) + v;
      }
      const rows = r.rows.map((x): StudentSummaryRow => ({
        id: x.student, name: x.name, admissionNo: x.admission_no, rollNo: x.roll_number,
        className: x.class_level_name, section: x.section_name, marked: x.marked,
        present: x.present, absent: x.absent, late: x.late, rate: x.rate,
      }));
      return { byStatus, rows };
    },
    staleTime: 60_000,
  });
}

// ── daily register ───────────────────────────────────────────────────────────

export interface RegisterRow { student: StudentRef; status: AttendanceStatus | undefined; remark: string }

export function useRegister(sectionId: string | undefined, date: string) {
  return useQuery({
    queryKey: ["attendance", "register", sectionId, date],
    queryFn: async () => {
      const r = await get<{
        date: string; holiday: string | null; marked: number;
        students: { student: string; name: string; roll_number: string; admission_number: string; status: string | null; remark: string }[];
      }>("/attendance/register/", { section: sectionId, date });
      return {
        holiday: r.holiday,
        marked: r.marked,
        rows: r.students.map((s): RegisterRow => ({
          student: { id: s.student, name: s.name, rollNo: s.roll_number || s.admission_number, className: "", section: "" },
          status: toStatus(s.status), remark: s.remark,
        })),
      };
    },
    enabled: !!sectionId,
  });
}

export function useSaveRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { date: string; records: { student: string; status: AttendanceStatus; remark?: string }[] }) =>
      post<{ results: unknown[] }>("/attendance/bulk/", {
        date: v.date, records: v.records.map((r) => ({ ...r, status: fromStatus(r.status) })),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ── monthly sheet ────────────────────────────────────────────────────────────

export function useMonthlySheet(sectionId: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: ["attendance", "monthly", sectionId, year, month],
    queryFn: async () => {
      const r = await get<{
        days: number; holidays: { name: string; start_date: string; end_date: string }[];
        rows: { student: string; name: string; roll_number: string; records: Record<string, string | null> }[];
      }>("/attendance/monthly/", { section: sectionId, year, month });
      const holidays: Holiday[] = [];
      for (const h of r.holidays) {
        for (let d = new Date(h.start_date); d <= new Date(h.end_date); d.setDate(d.getDate() + 1)) {
          holidays.push({ date: d.toISOString().slice(0, 10), name: h.name });
        }
      }
      const students: StudentRef[] = r.rows.map((x) => ({ id: x.student, name: x.name, rollNo: x.roll_number, className: "", section: "" }));
      const attendance: MonthlyAttendance[] = r.rows.map((x) => ({
        studentId: x.student, year, month,
        records: Object.fromEntries(Object.entries(x.records).filter(([, v]) => v).map(([d, v]) => [Number(d), toStatus(v)!])),
      }));
      return { students, attendance, holidays, days: r.days };
    },
    enabled: !!sectionId,
  });
}

// ── per student ──────────────────────────────────────────────────────────────

export function useStudentReport(studentId: string | undefined, from?: string, to?: string) {
  return useQuery({
    queryKey: ["attendance", "student", studentId, from, to],
    queryFn: () => get<{
      name: string; by_status: Record<string, number>; total: number; rate: number | null;
      months: { month: string; present: number; absent: number; total: number }[];
    }>("/attendance/student-report/", { student: studentId, date_from: from, date_to: to }),
    enabled: !!studentId,
  });
}

export function useStudentRecords(studentId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ["attendance", "records", studentId, from, to],
    queryFn: async () => {
      const rows = await getAll<Schemas["Attendance"]>("/attendance/", { student: studentId, date__gte: from, date__lte: to });
      return rows.map((r) => ({ date: r.date, status: toStatus(r.status)!, remark: r.remark ?? "" }));
    },
    enabled: !!studentId,
  });
}

// ── staff ────────────────────────────────────────────────────────────────────

export function useStaffMonthly(year: number, month: number) {
  return useQuery({
    queryKey: ["attendance", "staff", year, month],
    queryFn: async () => {
      const [sheet, teachers] = await Promise.all([
        get<{ days: number; rows: { teacher: string; name: string; employee_id: string; records: Record<string, string | null> }[] }>(
          "/staff-attendance/monthly/", { year, month }),
        getAll<Schemas["Teacher"]>("/teachers/"),
      ]);
      const byId = new Map(teachers.map((t) => [t.id, t]));
      const refs: TeacherRef[] = sheet.rows.map((r) => ({
        id: r.teacher, name: r.name, employeeId: r.employee_id,
        subject: byId.get(r.teacher)?.primary_subject_name ?? byId.get(r.teacher)?.subjects[0] ?? "",
        designation: byId.get(r.teacher)?.designation ?? "",
      }));
      const attendance: TeacherMonthlyAttendance[] = sheet.rows.map((r) => ({
        teacherId: r.teacher, year, month,
        records: Object.fromEntries(Object.entries(r.records).filter(([, v]) => v).map(([d, v]) => [Number(d), toStatus(v)!])),
      }));
      return { teachers: refs, attendance, days: sheet.days };
    },
  });
}

export function useSaveStaffRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { date: string; records: { teacher: string; status: AttendanceStatus }[] }) =>
      post("/staff-attendance/bulk/", { date: v.date, records: v.records.map((r) => ({ ...r, status: fromStatus(r.status) })) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance", "staff"] }),
  });
}

/** Holidays overlapping [from, to], one entry per calendar day. */
export function useHolidays(from: string, to: string) {
  return useQuery({
    queryKey: ["attendance", "holidays", from, to],
    queryFn: async () => {
      const rows = await getAll<Schemas["Holiday"]>("/holidays/", { start_date__lte: to, end_date__gte: from });
      const out: Holiday[] = [];
      for (const h of rows) {
        const end = h.end_date ?? h.start_date;
        for (let d = new Date(`${h.start_date}T00:00`); ; d.setDate(d.getDate() + 1)) {
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (iso > end || iso > to) break;
          if (iso >= from) out.push({ date: iso, name: h.name });
        }
      }
      return out;
    },
    staleTime: 5 * 60_000,
  });
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
