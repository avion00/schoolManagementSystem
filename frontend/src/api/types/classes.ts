/** Class view models (mapped from the API in api/classes.ts). */

export type ClassStatus = "active" | "inactive" | "suspended";
export type ClassMedium = "English" | "Nepali" | "Bilingual" | "";
export type ClassShift   = "Morning" | "Day" | "Evening" | "";

export interface ClassTeacherRef {
  id: string;
  name: string;
  employeeId: string;
}

export interface ClassSection {
  id: string;
  sectionName: string;
  sectionCode: string;
  classTeacher: string;
  room: string;
  capacity: number;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  attendanceAverage: number | null;
  status: "active" | "inactive";
}

export interface ClassSubject {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacher: string;
  weeklyPeriods: number;
  fullMarks: number;
  passMarks: number;
  type: "Compulsory" | "Optional";
  status: "active" | "inactive";
}

export interface ClassData {
  id: string;
  classId: string;
  className: string;
  gradeLevel: number;
  academicYear: string;
  medium: ClassMedium;
  shift: ClassShift;
  status: ClassStatus;
  building: string;
  mainRoom: string;
  description: string;
  mainClassTeacher: ClassTeacherRef | null;
  totalStudents: number;
  totalCapacity: number | null;
  sections: ClassSection[];
  subjects: ClassSubject[];
}

// ── Option lists ──────────────────────────────────────────────────────────────

export interface DetailStudent {
  id: string;
  admissionNo: string;
  registrationNo: string;
  name: string;
  section: string;
  roll: number | null;
  gender: string;
  attendancePct: number | null;
  feeStatus: "Paid" | "Due" | "Overdue" | "—";
  resultStatus: "Published" | "Pending" | "N/A";
}

export interface DetailTeacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  weeklyPeriods: number;
  section: string;
  role: "Class Teacher" | "Subject Teacher" | "Assistant Teacher";
  contact: string;
}

export interface TimetableSlot {
  subject: string;
  teacher: string;
  color: string;
}

export interface TimetableRow {
  time: string;
  isBreak?: boolean;
  monday: TimetableSlot | null;
  tuesday: TimetableSlot | null;
  wednesday: TimetableSlot | null;
  thursday: TimetableSlot | null;
  friday: TimetableSlot | null;
}

export interface AttendanceSummary {
  presentPct: number | null;
  absentPct: number;
  latePct: number;
  halfDayPct: number;
  totalDays: number;
  last7Days: number[];
  sectionWise: { section: string; pct: number }[];
}

export interface PerformanceSummary {
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  passPct: number;
  subjectWise: { subject: string; average: number }[];
  top5Students: { name: string; score: number; section: string }[];
  needsImprovement: number;
}

export interface FeesSummary {
  totalExpected: number;
  collected: number;
  due: number;
  overdue: number;
  scholarship: number;
  sectionWise: { section: string; collected: number; due: number }[];
}

export interface ClassExam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  fullMarks: number;
  status: "Upcoming" | "Completed" | "Cancelled";
}

export interface ClassDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedOn: string;
  status: "Available" | "Draft" | "Archived";
}

export interface ClassActivity {
  id: string;
  type: "create" | "section" | "student" | "timetable" | "attendance" | "exam" | "result" | "update";
  message: string;
  timestamp: string;
}

export interface ClassDetailView {
  students: DetailStudent[];
  teachers: DetailTeacher[];
  timetable: TimetableRow[];
  attendance: AttendanceSummary;
  performance: PerformanceSummary | null; // null until a class exam has results
  fees: FeesSummary | null; // null without fee.view
  exams: ClassExam[];
  documents: ClassDocument[];
  activities: ClassActivity[];
}
