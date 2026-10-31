/** Student view models used by the students pages (mapped from the API in api/students.ts). */

export type StudentStatus = "active" | "inactive" | "transferred" | "graduated" | "suspended" | "left";
export type StudentGender = "Male" | "Female" | "Other" | "";

export interface Student {
  id: string;
  admissionNo: string;
  registrationNo: string;
  name: string;
  gender: StudentGender;
  className: string;
  classId: string;
  section: string | null;
  sectionId: string | null;
  roll: number | null;
  parentName: string;
  mobile: string;
  email: string;
  address: string;
  dateOfBirth: string;
  status: StudentStatus;
  photoUrl: string | null;
}

export const STATUS_OPTIONS: StudentStatus[] = ["active", "inactive", "transferred", "graduated", "suspended", "left"];

// ── Types ────────────────────────────────────────────────────────────────────

export interface GuardianInfo {
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherEmail: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  motherEmail: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  emergencyContact: string;
}

export interface ContactInfo {
  email: string;
  mobile: string;
  currentAddress: string;
  permanentAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface AcademicExtra {
  house: string;
  previousSchool: string;
  classTeacher: string;
  session: string;
  medium: string;
  shift: string;
  subjectsCount: number;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  totalDays: number;
  presentPercent: number;
}

export interface AttendanceMonth {
  month: string;
  present: number;
  absent: number;
}

export interface ExamScore {
  subject: string;
  fullMarks: number;
  obtained: number;
  grade: string;
  gradePoint: number;
  remarks: "Excellent" | "Good" | "Satisfactory" | "Needs Improvement";
}

export interface ExamMeta {
  name: string;
  term: string;
  year: string;
  totalMarks: number;
  obtained: number;
  percentage: number;
  gpa: number;
  result: "Pass" | "Fail";
}

export interface RankInfo {
  classRank: number;
  classTotalStudents: number;
  sectionRank: number;
  sectionTotalStudents: number;
  overallPerformance: "Excellent" | "Good" | "Average" | "Below Average";
  averageScore: number;
  strengths: string[];
  improvements: string[];
}

export interface Award {
  id: string;
  title: string;
  category: "Academic" | "Sports" | "Leadership" | "Attendance" | "Cultural";
  date: string;
  description: string;
}

export interface FeeStatus {
  totalFee: number;
  paid: number;
  due: number;
  discount: number;
  nextDueDate: string;
  status: "Paid" | "Partial" | "Due" | "Overdue";
}

export interface Payment {
  receiptNo: string;
  date: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Overdue";
  description: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  uploadedDate: string;
  status: "Verified" | "Pending" | "Missing";
  size?: string;
}

export interface TimetableEntry {
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

export interface Remark {
  id: string;
  type: "positive" | "neutral" | "warning";
  author: string;
  role: string;
  date: string;
  content: string;
}

export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: "emerald" | "blue" | "amber" | "violet" | "rose" | "sky";
}

export interface HealthInfo {
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string[];
  medicalNotes: string;
  doctorName: string;
  doctorPhone: string;
}

export interface TransportInfo {
  busRoute: string;
  busNo: string;
  pickupPoint: string;
  pickupTime: string;
  driverName: string;
  driverPhone: string;
}

export interface HostelInfo {
  enrolled: boolean;
  hostelName: string;
  roomNo: string;
  roomType: string;
  wardenName: string;
  wardenPhone: string;
}

export interface StudentDetailView {
  guardian: GuardianInfo;
  contact: ContactInfo;
  academicExtra: AcademicExtra;
  personalExtra: {
    bloodGroup: string;
    nationality: string;
    religion: string;
    studentType: string;
  };
  attendanceSummary: AttendanceSummary;
  attendanceMonthly: AttendanceMonth[];
  scores: ExamScore[];
  examMeta: ExamMeta | null;
  rank: RankInfo | null;
  awards: Award[];
  fees: FeeStatus | null; // null when the viewer lacks fee.view
  payments: Payment[];
  documents: StudentDocument[];
  timetable: TimetableEntry[];
  remarks: Remark[];
  activities: ActivityItem[];
  health: HealthInfo;
  transport: TransportInfo | null; // transport module not built yet
  hostel: HostelInfo | null;
}
