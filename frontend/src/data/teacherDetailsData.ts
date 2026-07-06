export interface TeacherPersonalExtra {
  nationality: string;
  bloodGroup: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
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
  paymentStatus: "Paid" | "Pending" | "Overdue";
  paymentMethod: "Bank Transfer" | "Cash" | "Cheque";
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

export interface TeacherDetailMock {
  personalExtra: TeacherPersonalExtra;
  employmentExtra: TeacherEmploymentExtra;
  attendanceSummary: TeacherAttendanceSummary;
  attendanceMonthly: AttendanceMonth[];
  performance: TeacherPerformance;
  payroll: PayrollInfo;
  monthlyPayHistory: MonthlyPay[];
  documents: TeacherDocument[];
  activities: TeacherActivity[];
  todaySchedule: ScheduleEntry[];
}

export const TEACHER_DETAIL_MOCK: TeacherDetailMock = {
  personalExtra: {
    nationality: "Nepali",
    bloodGroup: "B+",
    maritalStatus: "Married",
    spouseName: "Farida Fahim",
    emergencyContact: "+977-9841111222",
    emergencyRelation: "Spouse",
    permanentAddress: "Dharan, Sunsari, Province 1",
    religion: "Islam",
  },

  employmentExtra: {
    secondarySubjects: ["Physics", "Statistics"],
    classTeacherOf: "Grade 10A",
    weeklyPeriods: 24,
    examDuties: ["Mid-term Invigilation", "Annual Marking — Math", "Result Verification"],
    clubs: ["Math Club — Coordinator", "Science Fair — Judge"],
    skills: ["Python", "MATLAB", "Smart Board", "Curriculum Design", "Counseling"],
    previousSchools: ["Shree Pashupati Secondary School (2008–2014)", "New Light Secondary School (2005–2008)"],
    certifications: ["TRC — Teaching Registration Certificate", "CPD — Continuing Professional Development 2025"],
  },

  attendanceSummary: {
    presentDays: 218,
    absentDays: 8,
    leaveDays: 14,
    totalWorkingDays: 240,
    percentage: 90.8,
  },

  attendanceMonthly: [
    { month: "Jan", present: 22, absent: 0, total: 22 },
    { month: "Feb", present: 19, absent: 1, total: 20 },
    { month: "Mar", present: 20, absent: 2, total: 22 },
    { month: "Apr", present: 21, absent: 0, total: 21 },
    { month: "May", present: 20, absent: 1, total: 21 },
    { month: "Jun", present: 18, absent: 2, total: 20 },
    { month: "Jul", present: 21, absent: 0, total: 21 },
    { month: "Aug", present: 19, absent: 1, total: 20 },
    { month: "Sep", present: 20, absent: 1, total: 21 },
    { month: "Oct", present: 21, absent: 0, total: 21 },
    { month: "Nov", present: 19, absent: 0, total: 19 },
    { month: "Dec", present: 18, absent: 0, total: 18 },
  ],

  performance: {
    teachingRating: 4.5,
    studentFeedbackScore: 88,
    lessonCompletionPct: 96,
    examPassRatePct: 92,
    punctualityScore: 94,
    strengths: ["Clear Explanations", "Student Engagement", "Problem Solving", "Curriculum Adherence"],
    improvements: ["Digital Tools Usage", "Homework Follow-up"],
  },

  payroll: {
    basicSalary: 65000,
    houseAllowance: 8000,
    transportAllowance: 3000,
    otherAllowance: 2000,
    providentFundDeduction: 7800,
    taxDeduction: 5200,
    otherDeduction: 500,
    netSalary: 64500,
    lastPaidDate: "2026-06-30",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    bankName: "Nepal Investment Bank",
    accountNo: "XXXX-XXXX-4521",
  },

  monthlyPayHistory: [
    { month: "Jun 2026", amount: 64500, status: "Paid" },
    { month: "May 2026", amount: 64500, status: "Paid" },
    { month: "Apr 2026", amount: 64500, status: "Paid" },
    { month: "Mar 2026", amount: 64500, status: "Paid" },
    { month: "Feb 2026", amount: 64500, status: "Paid" },
    { month: "Jan 2026", amount: 62000, status: "Paid" },
  ],

  documents: [
    { id: "d1", name: "Teaching Registration Certificate", type: "PDF", uploadedOn: "2024-08-01", size: "420 KB", status: "Verified" },
    { id: "d2", name: "Appointment Letter",                type: "PDF", uploadedOn: "2014-07-01", size: "318 KB", status: "Verified" },
    { id: "d3", name: "Citizenship Certificate",          type: "PDF", uploadedOn: "2024-08-01", size: "650 KB", status: "Verified" },
    { id: "d4", name: "Academic Degree — M.Sc.",          type: "PDF", uploadedOn: "2024-08-01", size: "880 KB", status: "Verified" },
    { id: "d5", name: "Experience Certificate",           type: "PDF", uploadedOn: "2024-08-15", size: "210 KB", status: "Pending" },
    { id: "d6", name: "Medical Certificate",              type: "PDF", uploadedOn: "2025-01-10", size: "195 KB", status: "Expired" },
    { id: "d7", name: "CPD Certificate 2025",             type: "PDF", uploadedOn: "2025-11-20", size: "340 KB", status: "Verified" },
  ],

  activities: [
    { id: "a1", type: "salary",     message: "Salary of NPR 64,500 processed for June 2026.", timestamp: "2026-06-30T10:00:00Z" },
    { id: "a2", type: "award",      message: 'Awarded "Teacher of the Quarter" — Q2 2026.',  timestamp: "2026-06-15T11:30:00Z" },
    { id: "a3", type: "exam",       message: "Completed annual exam marking — Mathematics.",  timestamp: "2026-05-28T14:00:00Z" },
    { id: "a4", type: "class",      message: "Assigned as Class Teacher of Grade 10A.",       timestamp: "2026-04-01T09:00:00Z" },
    { id: "a5", type: "salary",     message: "Salary of NPR 64,500 processed for May 2026.", timestamp: "2026-05-31T10:00:00Z" },
    { id: "a6", type: "update",     message: "Profile updated — permanent address changed.",  timestamp: "2026-03-12T16:00:00Z" },
    { id: "a7", type: "attendance", message: "Leave approved — Medical leave (2 days).",     timestamp: "2026-02-20T08:30:00Z" },
    { id: "a8", type: "class",      message: "Grade 10A schedule updated for Semester 2.",   timestamp: "2026-01-10T10:00:00Z" },
    { id: "a9", type: "join",       message: "Joined SchoolOS — employee record created.",   timestamp: "2014-07-01T09:00:00Z" },
  ],

  todaySchedule: [
    { period: 1, time: "07:45 – 08:30", subject: "Mathematics",   className: "Grade 10A", room: "Room 201" },
    { period: 2, time: "08:30 – 09:15", subject: "Mathematics",   className: "Grade 9B",  room: "Room 201" },
    { period: 0, time: "09:15 – 09:30", subject: "Short Break",   className: "",          room: "",         isBreak: true },
    { period: 3, time: "09:30 – 10:15", subject: "Mathematics",   className: "Grade 8A",  room: "Room 201" },
    { period: 4, time: "10:15 – 11:00", subject: "Physics",       className: "Grade 9A",  room: "Lab 01"   },
    { period: 0, time: "11:00 – 11:45", subject: "Lunch Break",   className: "",          room: "",         isBreak: true },
    { period: 5, time: "11:45 – 12:30", subject: "Mathematics",   className: "Grade 10B", room: "Room 201" },
    { period: 6, time: "12:30 – 13:15", subject: "Free Period",   className: "",          room: "",         isBreak: true },
    { period: 7, time: "13:15 – 14:00", subject: "Mathematics",   className: "Grade 9A",  room: "Room 201" },
  ],
};
