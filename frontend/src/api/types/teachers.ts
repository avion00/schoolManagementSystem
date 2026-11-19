/** Teacher view models (mapped from the API in api/teachers.ts). */

export type TeacherStatus = "active" | "on leave" | "inactive" | "resigned" | "terminated";
export type TeacherGender = "Male" | "Female" | "Other" | "";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Substitute" | "";

export interface Teacher {
  id: string;
  employeeId: string;
  staffCode: string;
  name: string;
  gender: TeacherGender;
  department: string;
  subject: string;
  secondarySubjects: string[];
  assignedClasses: string[];
  phone: string;
  email: string;
  dateOfBirth: string;
  joiningDate: string;
  qualification: string;
  experienceYears: number;
  employmentType: EmploymentType;
  address: string;
  status: TeacherStatus;
  designation: string;
  salary: number | null; // null unless the viewer can see payroll
}

export const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = ["Full-time", "Part-time", "Contract", "Substitute"];

export interface TeacherPersonalExtra {
  nationality: string;
  bloodGroup: string;
  maritalStatus: string;
  spouseName: string;
  emergencyContact: string;
  emergencyRelation: string;
  permanentAddress: string;
  religion: string;
}

export interface TeacherEmploymentExtra {
  secondarySubjects: string[];
  classTeacherOf: string;
  weeklyPeriods: number;
  examDuties: string[];
  clubs: string[];
  skills: string[];
  previousSchools: string[];
  certifications: string[];
}

export interface AttendanceMonth {
  month: string;
  present: number;
  absent: number;
  total: number;
}

export interface TeacherAttendanceSummary {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalWorkingDays: number;
  percentage: number;
}

export interface TeacherPerformance {
  teachingRating: number;
  studentFeedbackScore: number;
  lessonCompletionPct: number;
  examPassRatePct: number;
  punctualityScore: number;
  strengths: string[];
  improvements: string[];
}

export interface PayrollInfo {
  basicSalary: number;
  houseAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  providentFundDeduction: number;
  taxDeduction: number;
  otherDeduction: number;
  netSalary: number;
  lastPaidDate: string;
  paymentStatus: string;
  paymentMethod: string;
  bankName: string;
  accountNo: string;
}

export interface MonthlyPay {
  month: string;
  amount: number;
  status: "Paid" | "Pending";
}

export interface TeacherDocument {
  id: string;
  name: string;
  type: string;
  uploadedOn: string;
  size: string;
  status: "Verified" | "Pending" | "Expired";
}

export interface TeacherActivity {
  id: string;
  type: "join" | "attendance" | "leave" | "salary" | "award" | "class" | "update" | "exam";
  message: string;
  timestamp: string;
}

export interface ScheduleEntry {
  period: number;
  time: string;
  subject: string;
  className: string;
  room: string;
  isBreak?: boolean;
}

export interface TeacherDetailView {
  personalExtra: TeacherPersonalExtra;
  employmentExtra: TeacherEmploymentExtra;
  attendanceSummary: TeacherAttendanceSummary;
  attendanceMonthly: AttendanceMonth[];
  performance: TeacherPerformance | null; // no performance reviews in the backend yet
  payroll: PayrollInfo | null; // null without payroll access or salary set
  monthlyPayHistory: MonthlyPay[];
  documents: TeacherDocument[];
  activities: TeacherActivity[];
  todaySchedule: ScheduleEntry[];
}
