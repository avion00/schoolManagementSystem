/** Attendance view models (mapped from the API in api/attendance.ts). */

export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "leave" | "holiday" | "excused";
export type AttendanceView = "daily" | "monthly" | "student" | "teacher" | "class";

export interface StudentRef {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  parentPhone?: string;
}

export interface TeacherRef {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  designation: string;
}

export interface MonthlyAttendance {
  studentId: string;
  year: number;
  month: number; // 1-based
  records: Record<number, AttendanceStatus>;
}

export interface TeacherMonthlyAttendance {
  teacherId: string;
  year: number;
  month: number;
  records: Record<number, AttendanceStatus>;
}

export interface AttendanceStats {
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  todayLeave: number;
  todayHalfDay: number;
  monthlyRate: number | null;
  weeklyTrend: number | null;
}

export interface Holiday { date: string; name: string }
export interface MonthlyTrendPoint { month: string; presentRate: number | null }
export interface ClassComparison { className: string; section: string; students: number; rate: number | null }

export const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "half-day", "leave"];
export const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
] as const;

export function countStatuses(records: Record<number, AttendanceStatus>) {
  const out = { present: 0, absent: 0, late: 0, "half-day": 0, leave: 0, holiday: 0, excused: 0 };
  for (const s of Object.values(records)) out[s] += 1;
  return out;
}

/** Present-like (present, late, half day) over marked days, as a percentage. */
export function calcRate(records: Record<number, AttendanceStatus>): number {
  const c = countStatuses(records);
  const marked = c.present + c.absent + c.late + c["half-day"] + c.leave + c.excused;
  return marked ? Math.round(((c.present + c.late + c["half-day"]) / marked) * 1000) / 10 : 0;
}
