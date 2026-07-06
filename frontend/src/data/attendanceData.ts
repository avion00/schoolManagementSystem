// ── Types ─────────────────────────────────────────────────────────────────────
export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "leave";
export type AttendanceView   = "daily" | "monthly" | "student" | "teacher" | "class";

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface StudentRef {
  id:        number;
  name:      string;
  rollNo:    string;
  className: string;
  section:   string;
  parentPhone?: string;
}

export interface TeacherRef {
  id:          number;
  name:        string;
  employeeId:  string;
  subject:     string;
  designation: string;
}

export interface DailyRecord {
  studentId: number;
  date:      string;   // YYYY-MM-DD
  status:    AttendanceStatus;
  note?:     string;
}

export interface TeacherDailyRecord {
  teacherId: number;
  date:      string;
  status:    AttendanceStatus;
  note?:     string;
}

export interface MonthlyAttendance {
  studentId:   number;
  year:        number;
  month:       number; // 1-based
  records:     Record<number, AttendanceStatus>; // day → status
}

export interface TeacherMonthlyAttendance {
  teacherId: number;
  year:      number;
  month:     number;
  records:   Record<number, AttendanceStatus>;
}

export interface AttendanceStats {
  todayPresent:  number;
  todayAbsent:   number;
  todayLate:     number;
  todayLeave:    number;
  todayHalfDay:  number;
  monthlyRate:   number; // percent
  weeklyTrend:   number; // +/- change from last week
}

export interface Holiday {
  date: string;
  name: string;
}

export interface MonthlyTrendPoint {
  month:       string;
  presentRate: number;
}

export interface ClassComparison {
  className: string;
  section:   string;
  students:  number;
  rate:      number;
}

// ── Reference data ────────────────────────────────────────────────────────────
export const STUDENTS_G6A: StudentRef[] = [
  { id: 101, name: "Aarav Sharma",    rollNo: "6A-01", className: "Grade 6", section: "A", parentPhone: "9801000101" },
  { id: 102, name: "Priya Thapa",     rollNo: "6A-02", className: "Grade 6", section: "A", parentPhone: "9801000102" },
  { id: 103, name: "Rohan Karki",     rollNo: "6A-03", className: "Grade 6", section: "A", parentPhone: "9801000103" },
  { id: 104, name: "Sita Rana",       rollNo: "6A-04", className: "Grade 6", section: "A", parentPhone: "9801000104" },
  { id: 105, name: "Bikash Poudel",   rollNo: "6A-05", className: "Grade 6", section: "A", parentPhone: "9801000105" },
  { id: 106, name: "Anita Gurung",    rollNo: "6A-06", className: "Grade 6", section: "A", parentPhone: "9801000106" },
  { id: 107, name: "Dipesh Tamang",   rollNo: "6A-07", className: "Grade 6", section: "A", parentPhone: "9801000107" },
  { id: 108, name: "Kamala Magar",    rollNo: "6A-08", className: "Grade 6", section: "A", parentPhone: "9801000108" },
  { id: 109, name: "Suresh Basnet",   rollNo: "6A-09", className: "Grade 6", section: "A", parentPhone: "9801000109" },
  { id: 110, name: "Nisha Pandey",    rollNo: "6A-10", className: "Grade 6", section: "A", parentPhone: "9801000110" },
];

export const STUDENTS_G7A: StudentRef[] = [
  { id: 201, name: "Arjun Shrestha",  rollNo: "7A-01", className: "Grade 7", section: "A", parentPhone: "9801000201" },
  { id: 202, name: "Meena Joshi",     rollNo: "7A-02", className: "Grade 7", section: "A", parentPhone: "9801000202" },
  { id: 203, name: "Rajan Adhikari",  rollNo: "7A-03", className: "Grade 7", section: "A", parentPhone: "9801000203" },
  { id: 204, name: "Sunita Limbu",    rollNo: "7A-04", className: "Grade 7", section: "A", parentPhone: "9801000204" },
  { id: 205, name: "Kiran Rai",       rollNo: "7A-05", className: "Grade 7", section: "A", parentPhone: "9801000205" },
  { id: 206, name: "Puja Tamang",     rollNo: "7A-06", className: "Grade 7", section: "A", parentPhone: "9801000206" },
  { id: 207, name: "Nabin Karki",     rollNo: "7A-07", className: "Grade 7", section: "A", parentPhone: "9801000207" },
  { id: 208, name: "Sabita Gurung",   rollNo: "7A-08", className: "Grade 7", section: "A", parentPhone: "9801000208" },
];

export const ALL_STUDENTS: StudentRef[] = [...STUDENTS_G6A, ...STUDENTS_G7A];

export const TEACHERS_REF: TeacherRef[] = [
  { id: 1, name: "Andrew Martin",   employeeId: "T001", subject: "Mathematics",      designation: "Senior Teacher" },
  { id: 2, name: "Kazi Fahim",      employeeId: "T002", subject: "Science",           designation: "Teacher" },
  { id: 3, name: "Sita Rai",        employeeId: "T003", subject: "English",           designation: "Senior Teacher" },
  { id: 4, name: "Ramesh Adhikari", employeeId: "T004", subject: "Nepali",            designation: "Teacher" },
  { id: 5, name: "Sunita Gurung",   employeeId: "T005", subject: "Social Studies",    designation: "Teacher" },
  { id: 6, name: "Kavita Joshi",    employeeId: "T006", subject: "Computer Science",  designation: "Teacher" },
  { id: 7, name: "Binod Karki",     employeeId: "T007", subject: "Physical Education",designation: "Teacher" },
  { id: 8, name: "Mira Shrestha",   employeeId: "T008", subject: "Arts & Crafts",     designation: "Teacher" },
];

export const HOLIDAYS: Holiday[] = [
  { date: "2026-07-17", name: "Eid al-Adha" },
];

// Weekend days for July 2026: 4,5,11,12,18,19,25,26 (Sat/Sun)
export const JULY_WEEKENDS = new Set([4, 5, 11, 12, 18, 19, 25, 26]);
export const JULY_HOLIDAYS  = new Set([17]); // Eid al-Adha

export function isWorkingDay(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return false;
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return !HOLIDAYS.some((h) => h.date === dateStr);
}

// ── Generator helpers ─────────────────────────────────────────────────────────

/**
 * Generate monthly attendance records for a student list.
 * exceptions: { day: { studentIndex: status } }
 * Non-exception working days → "present"
 */
function genMonthlyStudentAtt(
  students:   StudentRef[],
  year:       number,
  month:      number,
  exceptions: Record<number, Record<number, AttendanceStatus>>,
  cutoffDay?: number, // only generate up to this day (for current month partial data)
): MonthlyAttendance[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDay = cutoffDay ?? daysInMonth;

  return students.map((s, si) => {
    const records: Record<number, AttendanceStatus> = {};
    for (let d = 1; d <= maxDay; d++) {
      if (!isWorkingDay(year, month, d)) continue;
      const dayExc = exceptions[d];
      if (dayExc && dayExc[si] !== undefined) {
        records[d] = dayExc[si];
      } else {
        records[d] = "present";
      }
    }
    return { studentId: s.id, year, month, records };
  });
}

function genMonthlyTeacherAtt(
  teachers:   TeacherRef[],
  year:       number,
  month:      number,
  exceptions: Record<number, Record<number, AttendanceStatus>>,
  cutoffDay?: number,
): TeacherMonthlyAttendance[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDay = cutoffDay ?? daysInMonth;

  return teachers.map((t, ti) => {
    const records: Record<number, AttendanceStatus> = {};
    for (let d = 1; d <= maxDay; d++) {
      if (!isWorkingDay(year, month, d)) continue;
      const dayExc = exceptions[d];
      if (dayExc && dayExc[ti] !== undefined) {
        records[d] = dayExc[ti];
      } else {
        records[d] = "present";
      }
    }
    return { teacherId: t.id, year, month, records };
  });
}

// ── G6A June 2026 ─────────────────────────────────────────────────────────────
// Working days in June 2026: 1-5, 8-12, 15-19, 22-26, 29-30 (Mon-Fri)
const G6A_JUNE_EXC: Record<number, Record<number, AttendanceStatus>> = {
  2:  { 2: "absent" },
  5:  { 7: "late" },
  8:  { 4: "absent" },
  9:  { 1: "late" },
  10: { 6: "absent" },
  11: { 9: "leave" },
  12: { 3: "half-day" },
  15: { 0: "absent" },
  16: { 8: "late" },
  17: { 5: "absent" },
  18: { 2: "late" },
  19: { 7: "absent" },
  22: { 4: "leave" },
  23: { 0: "late" },
  24: { 6: "absent" },
  25: { 1: "absent" },
  26: { 3: "late" },
  29: { 9: "absent" },
  30: { 8: "half-day" },
};

// ── G6A July 2026 (working days so far: 1,2,3,6) ─────────────────────────────
const G6A_JULY_EXC: Record<number, Record<number, AttendanceStatus>> = {
  2: { 5: "late" },
  3: { 9: "absent" },
  6: { 3: "late" },
};

// ── G7A July 2026 ─────────────────────────────────────────────────────────────
const G7A_JULY_EXC: Record<number, Record<number, AttendanceStatus>> = {
  2: { 2: "absent" },
  6: { 6: "late" },
};

// ── Teacher July 2026 ─────────────────────────────────────────────────────────
// index 5=Kavita, 7=Mira
const TEACHER_JULY_EXC: Record<number, Record<number, AttendanceStatus>> = {
  3: { 5: "absent" },
  6: { 7: "half-day" },
};

// ── Generated data ────────────────────────────────────────────────────────────
export const G6A_JUNE_ATT  = genMonthlyStudentAtt(STUDENTS_G6A, 2026, 6, G6A_JUNE_EXC);
export const G6A_JULY_ATT  = genMonthlyStudentAtt(STUDENTS_G6A, 2026, 7, G6A_JULY_EXC, 6);
export const G7A_JULY_ATT  = genMonthlyStudentAtt(STUDENTS_G7A, 2026, 7, G7A_JULY_EXC, 6);
export const TEACHER_JULY_ATT = genMonthlyTeacherAtt(TEACHERS_REF, 2026, 7, TEACHER_JULY_EXC, 6);

// ── Lookup helpers ────────────────────────────────────────────────────────────
export function getStudentMonthAtt(
  studentId: number, year: number, month: number,
): MonthlyAttendance | undefined {
  const all = [G6A_JUNE_ATT, G6A_JULY_ATT, G7A_JULY_ATT].flat();
  return all.find((r) => r.studentId === studentId && r.year === year && r.month === month);
}

export function getTeacherMonthAtt(
  teacherId: number, year: number, month: number,
): TeacherMonthlyAttendance | undefined {
  return TEACHER_JULY_ATT.find((r) => r.teacherId === teacherId && r.year === year && r.month === month);
}

/** Count statuses from a records map */
export function countStatuses(records: Record<number, AttendanceStatus>): Record<AttendanceStatus, number> {
  const out: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, "half-day": 0, leave: 0 };
  for (const s of Object.values(records)) out[s]++;
  return out;
}

/** Attendance rate = (present + late*0.5 + half-day*0.5) / workingDays */
export function calcRate(records: Record<number, AttendanceStatus>, workingDays: number): number {
  if (workingDays === 0) return 0;
  let score = 0;
  for (const s of Object.values(records)) {
    if (s === "present") score += 1;
    else if (s === "late" || s === "half-day") score += 0.5;
  }
  return Math.round((score / workingDays) * 100);
}

// ── Dashboard stats ────────────────────────────────────────────────────────────
// Today = 2026-07-06 (Monday). G6A (10) + G7A (8) + Teachers (8) = 26 people
// G6A today: index 3 = late → 9 present, 1 late
// G7A today: index 6 = late → 7 present, 1 late
// Teachers today: index 7 (Mira) = half-day → 7 present, 1 half-day
export const ATTENDANCE_STATS: AttendanceStats = {
  todayPresent:  23,  // 9+7+7
  todayAbsent:   0,
  todayLate:     2,   // G6A idx3 + G7A idx6
  todayLeave:    0,
  todayHalfDay:  1,   // Mira Shrestha
  monthlyRate:   94,
  weeklyTrend:   +2,
};

// ── Monthly trend (last 6 months) ─────────────────────────────────────────────
export const MONTHLY_TREND: MonthlyTrendPoint[] = [
  { month: "Feb 2026", presentRate: 91 },
  { month: "Mar 2026", presentRate: 89 },
  { month: "Apr 2026", presentRate: 93 },
  { month: "May 2026", presentRate: 88 },
  { month: "Jun 2026", presentRate: 92 },
  { month: "Jul 2026", presentRate: 94 },
];

// ── Class comparison ───────────────────────────────────────────────────────────
export const CLASS_COMPARISON: ClassComparison[] = [
  { className: "Grade 6",  section: "A", students: 10, rate: 94 },
  { className: "Grade 6",  section: "B", students: 10, rate: 91 },
  { className: "Grade 7",  section: "A", students: 8,  rate: 96 },
  { className: "Grade 7",  section: "B", students: 9,  rate: 88 },
  { className: "Grade 8",  section: "A", students: 11, rate: 93 },
  { className: "Grade 9",  section: "A", students: 10, rate: 87 },
];

// ── Options arrays ─────────────────────────────────────────────────────────────
export const CLASS_OPTIONS = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
  "Grade 11","Grade 12",
] as const;

export const SECTION_OPTIONS = ["A", "B", "C", "D"] as const;

export const MONTH_OPTIONS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

export const YEAR_OPTIONS = ["2025", "2026", "2027"] as const;

export const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "half-day", "leave"];

// Today's date string
export const TODAY = "2026-07-06";
export const TODAY_DAY = 6;
export const TODAY_MONTH = 7;
export const TODAY_YEAR  = 2026;
