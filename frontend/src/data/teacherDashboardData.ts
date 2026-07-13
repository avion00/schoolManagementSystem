/**
 * Mock data for the Teacher workspace. Everything here is scoped to ONE
 * demo teacher (Aditi Sharma) and her assigned classes only — this file
 * intentionally does not reach into the school-wide admin datasets
 * (studentsData.ts, etc.) so the teacher pages never accidentally leak
 * global/admin-only records.
 */

export type PeriodStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type AttendanceMark = "Present" | "Absent" | "Late" | "Half Day" | "Leave";
export type MarksStatus = "Draft" | "Submitted" | "Approved" | "Returned";
export type AssignmentStatus = "Active" | "Closed";
export type LessonPlanStatus = "Draft" | "Submitted" | "Reviewed";
export type PrincipalReviewStatus = "Pending" | "Approved" | "Changes requested";
export type MaterialType = "PDF" | "Doc" | "Image" | "Video";
export type PerformanceLevel = "Excellent" | "Good" | "Average" | "Needs Improvement";
export type StudentRecordStatus = "Active" | "Inactive" | "Transferred";

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  subjects: string[];
  joinDate: string;
  avatarInitials: string;
}

export const teacherProfile: TeacherProfile = {
  id: "t-001",
  name: "Demo Teacher",
  email: "teacher@demo.school",
  employeeId: "EMP-2019-041",
  department: "Science & Mathematics",
  designation: "Senior Teacher",
  subjects: ["Mathematics", "Science"],
  joinDate: "2019-06-01",
  avatarInitials: "DT",
};

export interface AssignedClass {
  id: string;
  className: string;
  section: string;
  subject: string;
  room: string;
  isClassTeacher: boolean;
  students: number;
  attendanceRate: number;
  pendingMarks: number;
  nextClass: string;
}

export const assignedClasses: AssignedClass[] = [
  { id: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", room: "Room 204", isClassTeacher: true,  students: 34, attendanceRate: 92, pendingMarks: 8, nextClass: "10:30 AM" },
  { id: "class-8-b",  className: "Grade 8",  section: "B", subject: "Mathematics", room: "Room 204", isClassTeacher: false, students: 32, attendanceRate: 89, pendingMarks: 6, nextClass: "1:15 PM"  },
  { id: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     room: "Lab 1",     isClassTeacher: false, students: 30, attendanceRate: 95, pendingMarks: 0, nextClass: "Tomorrow, 9:00 AM" },
  { id: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", room: "Room 204", isClassTeacher: false, students: 32, attendanceRate: 87, pendingMarks: 18, nextClass: "Tomorrow, 11:30 AM" },
];

export interface AssignedStudent {
  id: number;
  name: string;
  registrationNo: string;
  admissionNo: string;
  classId: string;
  className: string;
  section: string;
  roll: number;
  guardian: string;
  guardianPhone: string;
  guardianEmail: string;
  attendancePercentage: number;
  performance: PerformanceLevel;
  status: StudentRecordStatus;
  pendingHomework: number;
  feeStatusNote: string;
}

export const assignedStudents: AssignedStudent[] = [
  { id: 1,  name: "Aarav Khan",      registrationNo: "REG-2026-0001", admissionNo: "ADM-2000", classId: "class-8-a", className: "Grade 8", section: "A", roll: 1,  guardian: "David Khan",       guardianPhone: "+977 9841000001", guardianEmail: "david.khan@example.com",       attendancePercentage: 88.8, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 2,  name: "Aisha Sharma",    registrationNo: "REG-2026-0002", admissionNo: "ADM-2001", classId: "class-8-a", className: "Grade 8", section: "A", roll: 2,  guardian: "Ravi Sharma",       guardianPhone: "+977 9841000002", guardianEmail: "ravi.sharma@example.com",      attendancePercentage: 96.4, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 3,  name: "Noah Brown",      registrationNo: "REG-2026-0003", admissionNo: "ADM-2002", classId: "class-8-a", className: "Grade 8", section: "A", roll: 3,  guardian: "Michael Brown",     guardianPhone: "+977 9841000003", guardianEmail: "michael.brown@example.com",    attendancePercentage: 74.2, performance: "Needs Improvement", status: "Active", pendingHomework: 3, feeStatusNote: "Contact office" },
  { id: 4,  name: "Priya Singh",     registrationNo: "REG-2026-0004", admissionNo: "ADM-2003", classId: "class-8-a", className: "Grade 8", section: "A", roll: 4,  guardian: "Rajesh Singh",      guardianPhone: "+977 9841000004", guardianEmail: "rajesh.singh@example.com",     attendancePercentage: 91.0, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 5,  name: "Arjun Patel",     registrationNo: "REG-2026-0005", admissionNo: "ADM-2004", classId: "class-8-a", className: "Grade 8", section: "A", roll: 5,  guardian: "Suresh Patel",      guardianPhone: "+977 9841000005", guardianEmail: "suresh.patel@example.com",     attendancePercentage: 68.5, performance: "Needs Improvement", status: "Active", pendingHomework: 2, feeStatusNote: "Contact office" },
  { id: 6,  name: "Emma Wilson",     registrationNo: "REG-2026-0006", admissionNo: "ADM-2005", classId: "class-8-a", className: "Grade 8", section: "A", roll: 6,  guardian: "James Wilson",      guardianPhone: "+977 9841000006", guardianEmail: "james.wilson@example.com",     attendancePercentage: 94.7, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 7,  name: "Rohan Gupta",     registrationNo: "REG-2026-0007", admissionNo: "ADM-2006", classId: "class-8-a", className: "Grade 8", section: "A", roll: 7,  guardian: "Vijay Gupta",       guardianPhone: "+977 9841000007", guardianEmail: "vijay.gupta@example.com",      attendancePercentage: 85.1, performance: "Good",              status: "Active", pendingHomework: 1, feeStatusNote: "Contact office" },

  { id: 11, name: "Neha Verma",      registrationNo: "REG-2026-0011", admissionNo: "ADM-2010", classId: "class-8-b", className: "Grade 8", section: "B", roll: 1,  guardian: "Sunil Verma",       guardianPhone: "+977 9841000011", guardianEmail: "sunil.verma@example.com",      attendancePercentage: 89.6, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 12, name: "James Harris",    registrationNo: "REG-2026-0012", admissionNo: "ADM-2011", classId: "class-8-b", className: "Grade 8", section: "B", roll: 2,  guardian: "Robert Harris",     guardianPhone: "+977 9841000012", guardianEmail: "robert.harris@example.com",    attendancePercentage: 92.3, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 13, name: "Zara Ali",        registrationNo: "REG-2026-0013", admissionNo: "ADM-2012", classId: "class-8-b", className: "Grade 8", section: "B", roll: 3,  guardian: "Mohammed Ali",      guardianPhone: "+977 9841000013", guardianEmail: "mohammed.ali@example.com",     attendancePercentage: 97.8, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 14, name: "Liam Johnson",    registrationNo: "REG-2026-0014", admissionNo: "ADM-2013", classId: "class-8-b", className: "Grade 8", section: "B", roll: 4,  guardian: "John Johnson",      guardianPhone: "+977 9841000014", guardianEmail: "john.johnson@example.com",     attendancePercentage: 71.4, performance: "Needs Improvement", status: "Active", pendingHomework: 2, feeStatusNote: "Contact office" },
  { id: 15, name: "Charlotte Lee",   registrationNo: "REG-2026-0015", admissionNo: "ADM-2014", classId: "class-8-b", className: "Grade 8", section: "B", roll: 5,  guardian: "David Lee",         guardianPhone: "+977 9841000015", guardianEmail: "david.lee@example.com",        attendancePercentage: 88.0, performance: "Good",              status: "Active", pendingHomework: 1, feeStatusNote: "Contact office" },
  { id: 16, name: "Ethan Davis",     registrationNo: "REG-2026-0016", admissionNo: "ADM-2015", classId: "class-8-b", className: "Grade 8", section: "B", roll: 6,  guardian: "William Davis",     guardianPhone: "+977 9841000016", guardianEmail: "william.davis@example.com",    attendancePercentage: 93.9, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },

  { id: 19, name: "Ananya Reddy",    registrationNo: "REG-2026-0019", admissionNo: "ADM-2018", classId: "class-9-a", className: "Grade 9", section: "A", roll: 1,  guardian: "Venkat Reddy",      guardianPhone: "+977 9841000019", guardianEmail: "venkat.reddy@example.com",     attendancePercentage: 96.1, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 20, name: "Lucas Walker",    registrationNo: "REG-2026-0020", admissionNo: "ADM-2019", classId: "class-9-a", className: "Grade 9", section: "A", roll: 2,  guardian: "Andrew Walker",     guardianPhone: "+977 9841000020", guardianEmail: "andrew.walker@example.com",    attendancePercentage: 90.5, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 21, name: "Kavya Iyer",      registrationNo: "REG-2026-0021", admissionNo: "ADM-2020", classId: "class-9-a", className: "Grade 9", section: "A", roll: 3,  guardian: "Rajan Iyer",        guardianPhone: "+977 9841000021", guardianEmail: "rajan.iyer@example.com",       attendancePercentage: 94.4, performance: "Excellent",         status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 22, name: "Ethan Hall",      registrationNo: "REG-2026-0022", admissionNo: "ADM-2021", classId: "class-9-a", className: "Grade 9", section: "A", roll: 4,  guardian: "Stephen Hall",      guardianPhone: "+977 9841000022", guardianEmail: "stephen.hall@example.com",     attendancePercentage: 82.7, performance: "Average",           status: "Active", pendingHomework: 1, feeStatusNote: "Contact office" },

  { id: 34, name: "Aarav Roy",       registrationNo: "REG-2026-0034", admissionNo: "ADM-2033", classId: "class-10-a", className: "Grade 10", section: "A", roll: 1, guardian: "Subir Roy",        guardianPhone: "+977 9841000034", guardianEmail: "subir.roy@example.com",        attendancePercentage: 79.3, performance: "Average",           status: "Active", pendingHomework: 1, feeStatusNote: "Contact office" },
  { id: 36, name: "Ryan Ahmed",      registrationNo: "REG-2026-0036", admissionNo: "ADM-2035", classId: "class-10-a", className: "Grade 10", section: "A", roll: 3, guardian: "Tariq Ahmed",       guardianPhone: "+977 9841000036", guardianEmail: "tariq.ahmed@example.com",      attendancePercentage: 65.8, performance: "Needs Improvement", status: "Active", pendingHomework: 3, feeStatusNote: "Contact office" },
  { id: 38, name: "Samuel Nair",     registrationNo: "REG-2026-0038", admissionNo: "ADM-2037", classId: "class-10-a", className: "Grade 10", section: "A", roll: 5, guardian: "Suresh Nair",       guardianPhone: "+977 9841000038", guardianEmail: "suresh.nair@example.com",      attendancePercentage: 88.9, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
  { id: 40, name: "Arjun Das",       registrationNo: "REG-2026-0040", admissionNo: "ADM-2039", classId: "class-10-a", className: "Grade 10", section: "A", roll: 7, guardian: "Biswajit Das",      guardianPhone: "+977 9841000040", guardianEmail: "biswajit.das@example.com",     attendancePercentage: 91.6, performance: "Good",              status: "Active", pendingHomework: 0, feeStatusNote: "Contact office" },
];

export interface TimetableEntry {
  id: string;
  period: string;
  time: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  room: string;
  status: PeriodStatus;
}

export const todayTimetable: TimetableEntry[] = [
  { id: "tt-1", period: "1st", time: "8:00 – 8:45 AM",   classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", room: "Room 204", status: "Completed" },
  { id: "tt-2", period: "2nd", time: "8:50 – 9:35 AM",   classId: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     room: "Lab 1",     status: "Completed" },
  { id: "tt-3", period: "3rd", time: "9:40 – 10:25 AM",  classId: "class-8-b",  className: "Grade 8",  section: "B", subject: "Mathematics", room: "Room 204", status: "Ongoing"   },
  { id: "tt-4", period: "4th", time: "10:30 – 11:15 AM", classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", room: "Room 204", status: "Upcoming"  },
  { id: "tt-5", period: "5th", time: "11:45 – 12:30 PM", classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", room: "Room 204", status: "Cancelled" },
];

export interface PendingAttendanceItem {
  classId: string;
  className: string;
  section: string;
  subject: string;
  date: string;
}

export const pendingAttendance: PendingAttendanceItem[] = [
  { classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", date: "Today" },
];

export interface AttendanceSummaryEntry {
  classId: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  total: number;
}

export const attendanceSummary: AttendanceSummaryEntry[] = [
  { classId: "class-8-a",  present: 30, absent: 2, late: 1, halfDay: 1, leave: 0, total: 34 },
  { classId: "class-8-b",  present: 28, absent: 3, late: 0, halfDay: 0, leave: 1, total: 32 },
  { classId: "class-9-a",  present: 29, absent: 0, late: 1, halfDay: 0, leave: 0, total: 30 },
];

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  instructions: string;
  dueDate: string;
  createdDate: string;
  submissionsReceived: number;
  totalStudents: number;
  status: AssignmentStatus;
  attachments: string[];
  maxMarks?: number;
  rubric?: string;
  allowLateSubmission?: boolean;
  notifyEnabled?: boolean;
}

export const assignments: Assignment[] = [
  { id: "asg-1", title: "Algebra Worksheet — Linear Equations", classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", instructions: "Solve all 20 problems, show your working.", dueDate: "2026-07-15", createdDate: "2026-07-08", submissionsReceived: 26, totalStudents: 34, status: "Active", attachments: ["linear-equations-worksheet.pdf"] },
  { id: "asg-2", title: "Photosynthesis Lab Report",           classId: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     instructions: "Write up your lab observations from Tuesday's experiment.", dueDate: "2026-07-14", createdDate: "2026-07-07", submissionsReceived: 30, totalStudents: 30, status: "Closed", attachments: ["lab-report-template.docx"] },
  { id: "asg-3", title: "Quadratic Equations Practice Set",     classId: "class-8-b",  className: "Grade 8",  section: "B", subject: "Mathematics", instructions: "Complete exercises 4.1 to 4.3 from the textbook.", dueDate: "2026-07-16", createdDate: "2026-07-09", submissionsReceived: 12, totalStudents: 32, status: "Active", attachments: [] },
  { id: "asg-4", title: "Trigonometry Revision Sheet",          classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", instructions: "Review sine/cosine rule problems ahead of the unit test.", dueDate: "2026-07-18", createdDate: "2026-07-10", submissionsReceived: 4,  totalStudents: 32, status: "Active", attachments: ["trig-revision.pdf"] },
];

export interface Homework {
  id: string;
  title: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  dueDate: string;
  status: AssignmentStatus;
  submissionsReceived: number;
  totalStudents: number;
  instructions?: string;
}

export const homeworkList: Homework[] = [
  { id: "hw-1", title: "NCERT Ch. 6 — Q1 to Q8",         classId: "class-8-a", className: "Grade 8", section: "A", subject: "Mathematics", dueDate: "2026-07-13", status: "Active", submissionsReceived: 31, totalStudents: 34 },
  { id: "hw-2", title: "Read Chapter 9 — Light",          classId: "class-9-a", className: "Grade 9", section: "A", subject: "Science",     dueDate: "2026-07-12", status: "Closed", submissionsReceived: 30, totalStudents: 30 },
  { id: "hw-3", title: "Practice sheet — Fractions",      classId: "class-8-b", className: "Grade 8", section: "B", subject: "Mathematics", dueDate: "2026-07-14", status: "Active", submissionsReceived: 18, totalStudents: 32 },
];

export interface MarksPendingEntry {
  id: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  exam: string;
  studentsGraded: number;
  totalStudents: number;
  status: MarksStatus;
}

export const marksPending: MarksPendingEntry[] = [
  { id: "mk-1", classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", exam: "Unit Test 3",   studentsGraded: 26, totalStudents: 34, status: "Draft"     },
  { id: "mk-2", classId: "class-8-b",  className: "Grade 8",  section: "B", subject: "Mathematics", exam: "Unit Test 3",   studentsGraded: 32, totalStudents: 32, status: "Submitted" },
  { id: "mk-3", classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", exam: "Mid-Term",      studentsGraded: 14, totalStudents: 32, status: "Draft"     },
  { id: "mk-4", classId: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     exam: "Unit Test 2",   studentsGraded: 30, totalStudents: 30, status: "Approved"  },
  { id: "mk-5", classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", exam: "Mid-Term",      studentsGraded: 20, totalStudents: 34, status: "Returned"  },
];

export interface UpcomingExam {
  id: string;
  subject: string;
  classId: string;
  className: string;
  section: string;
  date: string;
  type: string;
  time?: string;
  room?: string;
  marksDeadline?: string;
  syllabusCoverage?: number;
}

export const upcomingExams: UpcomingExam[] = [
  { id: "ex-1", subject: "Mathematics", classId: "class-10-a", className: "Grade 10", section: "A", date: "2026-07-18", type: "Mid-Term Exam", time: "10:00 AM", room: "Room 204", marksDeadline: "2026-07-20", syllabusCoverage: 82 },
  { id: "ex-2", subject: "Science",     classId: "class-9-a",  className: "Grade 9",  section: "A", date: "2026-07-22", type: "Unit Test 3",   time: "9:00 AM",  room: "Lab 1",     marksDeadline: "2026-07-23", syllabusCoverage: 95 },
  { id: "ex-3", subject: "Mathematics", classId: "class-8-a",  className: "Grade 8",  section: "A", date: "2026-07-25", type: "Unit Test 4",   time: "11:00 AM", room: "Room 204", marksDeadline: "2026-07-27", syllabusCoverage: 68 },
];

export interface InvigilationDuty {
  id: string;
  exam: string;
  date: string;
  time: string;
  room: string;
  className: string;
}

export const invigilationDuties: InvigilationDuty[] = [
  { id: "iv-1", exam: "Mid-Term Exam — English",  date: "2026-07-19", time: "10:00 AM", room: "Room 112", className: "Grade 9" },
  { id: "iv-2", exam: "Mid-Term Exam — Social Studies", date: "2026-07-21", time: "10:00 AM", room: "Room 204", className: "Grade 10" },
];

export interface ExamPrepItem {
  id: string;
  examId: string;
  label: string;
  done: boolean;
}

export const examPrepChecklist: ExamPrepItem[] = [
  { id: "ep-1", examId: "ex-1", label: "Upload revision worksheet",       done: true  },
  { id: "ep-2", examId: "ex-1", label: "Share previous year question paper", done: false },
  { id: "ep-3", examId: "ex-1", label: "Finish Trigonometry chapter",     done: false },
  { id: "ep-4", examId: "ex-2", label: "Upload lab-report guidelines",    done: true  },
  { id: "ep-5", examId: "ex-3", label: "Assign revision homework",       done: false },
];

export interface TeacherMessage {
  id: string;
  from: string;
  role: "Parent" | "Student" | "Admin" | "Principal";
  context: string;
  preview: string;
  unread: boolean;
  time: string;
}

export const teacherMessages: TeacherMessage[] = [
  { id: "msg-1", from: "David Khan",     role: "Parent",    context: "Aarav Khan · Grade 8-A",  preview: "Could you share Aarav's progress in Mathematics this term?", unread: true,  time: "9:12 AM"  },
  { id: "msg-2", from: "Robert Harris",  role: "Parent",    context: "James Harris · Grade 8-B", preview: "James will be absent tomorrow for a medical appointment.",   unread: true,  time: "8:47 AM"  },
  { id: "msg-3", from: "Principal Office", role: "Principal", context: "Staff circular",         preview: "Please submit mid-term lesson plans by Friday.",             unread: true,  time: "Yesterday" },
  { id: "msg-4", from: "Admin Office",   role: "Admin",     context: "Timetable update",         preview: "Room 204 is booked for maintenance on Jul 20, 2–3 PM.",        unread: false, time: "Jul 9"    },
  { id: "msg-5", from: "Tariq Ahmed",    role: "Parent",    context: "Ryan Ahmed · Grade 10-A",  preview: "Thank you for the extra help session last week.",             unread: false, time: "Jul 8"    },
];

export interface TeacherNotice {
  id: string;
  title: string;
  category: "School" | "Exam" | "Staff" | "Class";
  date: string;
  pinned: boolean;
  body: string;
}

export const teacherNotices: TeacherNotice[] = [
  { id: "nt-1", title: "Mid-term examination schedule released",     category: "Exam",   date: "2026-07-10", pinned: true,  body: "Mid-term exams run Jul 18–24. Please review the full schedule and submit seating plans." },
  { id: "nt-2", title: "Staff meeting — Friday 3:30 PM",             category: "Staff",  date: "2026-07-09", pinned: true,  body: "Department heads to present Q1 curriculum progress in the staff room." },
  { id: "nt-3", title: "Annual sports day — volunteers needed",      category: "School", date: "2026-07-08", pinned: false, body: "Sign up to help supervise track events on Jul 28." },
  { id: "nt-4", title: "Grade 8-A field trip permission slips due",  category: "Class",  date: "2026-07-07", pinned: false, body: "Collect signed permission slips from Grade 8-A students by Jul 15." },
];

export interface LessonPlan {
  id: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  week: string;
  topic: string;
  objectives: string[];
  materials: string[];
  homework: string;
  status: LessonPlanStatus;
  principalReview: PrincipalReviewStatus;
}

export const lessonPlans: LessonPlan[] = [
  { id: "lp-1", classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", week: "Jul 14 – Jul 18", topic: "Linear Equations in Two Variables", objectives: ["Graph linear equations", "Solve simultaneous equations"], materials: ["Graph paper", "Worksheet set 6"], homework: "NCERT Ch. 6 — Q9 to Q14", status: "Submitted", principalReview: "Pending"  },
  { id: "lp-2", classId: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     week: "Jul 14 – Jul 18", topic: "Light — Reflection & Refraction",     objectives: ["Explain laws of reflection", "Demonstrate refraction with a prism"], materials: ["Prism kit", "Ray diagram sheets"], homework: "Read Chapter 9 summary", status: "Reviewed",  principalReview: "Approved" },
  { id: "lp-3", classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", week: "Jul 21 – Jul 25", topic: "Trigonometric Ratios",               objectives: ["Derive sine/cosine/tangent ratios", "Apply to right-triangle problems"], materials: ["Scientific calculators", "Trig table handout"], homework: "Trigonometry revision sheet", status: "Draft", principalReview: "Pending" },
];

export interface TeachingMaterial {
  id: string;
  title: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  type: MaterialType;
  uploadedDate: string;
  sharedWithClass: boolean;
  sizeLabel: string;
  views: number;
  downloads: number;
}

export const teachingMaterials: TeachingMaterial[] = [
  { id: "tm-1", title: "Linear Equations — Slide Deck",       classId: "class-8-a",  className: "Grade 8",  section: "A", subject: "Mathematics", type: "PDF",   uploadedDate: "2026-07-08", sharedWithClass: true,  sizeLabel: "2.4 MB", views: 58, downloads: 31 },
  { id: "tm-2", title: "Refraction Demo Video",                classId: "class-9-a",  className: "Grade 9",  section: "A", subject: "Science",     type: "Video", uploadedDate: "2026-07-06", sharedWithClass: true,  sizeLabel: "18 MB",  views: 42, downloads: 12 },
  { id: "tm-3", title: "Quadratic Equations Practice Answers", classId: "class-8-b",  className: "Grade 8",  section: "B", subject: "Mathematics", type: "Doc",   uploadedDate: "2026-07-05", sharedWithClass: false, sizeLabel: "540 KB", views: 3,  downloads: 1  },
  { id: "tm-4", title: "Trigonometry Ratio Chart",             classId: "class-10-a", className: "Grade 10", section: "A", subject: "Mathematics", type: "Image", uploadedDate: "2026-07-02", sharedWithClass: true,  sizeLabel: "1.1 MB", views: 64, downloads: 40 },
];

export interface PerformanceEntry {
  studentId: number;
  name: string;
  className: string;
  section: string;
  value: string;
}

export interface PerformanceSnapshot {
  topPerformers: PerformanceEntry[];
  needAttention: PerformanceEntry[];
  lowAttendance: PerformanceEntry[];
  pendingHomeworkStudents: PerformanceEntry[];
}

export const performanceSnapshot: PerformanceSnapshot = {
  topPerformers: [
    { studentId: 13, name: "Zara Ali",     className: "Grade 8", section: "B", value: "97.8% attendance · Excellent" },
    { studentId: 2,  name: "Aisha Sharma", className: "Grade 8", section: "A", value: "96.4% attendance · Excellent" },
    { studentId: 19, name: "Ananya Reddy", className: "Grade 9", section: "A", value: "96.1% attendance · Excellent" },
  ],
  needAttention: [
    { studentId: 36, name: "Ryan Ahmed",   className: "Grade 10", section: "A", value: "Needs Improvement · 3 pending homework" },
    { studentId: 5,  name: "Arjun Patel",  className: "Grade 8",  section: "A", value: "Needs Improvement · 2 pending homework" },
    { studentId: 3,  name: "Noah Brown",   className: "Grade 8",  section: "A", value: "Needs Improvement · 3 pending homework" },
  ],
  lowAttendance: [
    { studentId: 36, name: "Ryan Ahmed",  className: "Grade 10", section: "A", value: "65.8% attendance" },
    { studentId: 5,  name: "Arjun Patel", className: "Grade 8",  section: "A", value: "68.5% attendance" },
    { studentId: 14, name: "Liam Johnson", className: "Grade 8", section: "B", value: "71.4% attendance" },
  ],
  pendingHomeworkStudents: [
    { studentId: 36, name: "Ryan Ahmed",   className: "Grade 10", section: "A", value: "3 assignments pending" },
    { studentId: 3,  name: "Noah Brown",   className: "Grade 8",  section: "A", value: "3 assignments pending" },
    { studentId: 5,  name: "Arjun Patel",  className: "Grade 8",  section: "A", value: "2 assignments pending" },
  ],
};

/* ── Derived dashboard summary (never hand-typed / disconnected from the arrays above) ── */
export const teacherSummary = {
  myClasses: assignedClasses.length,
  myStudents: assignedClasses.reduce((sum, c) => sum + c.students, 0),
  todaysClasses: todayTimetable.length,
  pendingAttendance: pendingAttendance.length,
  assignmentsDue: assignments.filter((a) => a.status === "Active").length,
  marksPending: marksPending.reduce((sum, m) => sum + (m.totalStudents - m.studentsGraded), 0),
  unreadMessages: teacherMessages.filter((m) => m.unread).length,
  upcomingExams: upcomingExams.length,
};

/* ══════════════════════════════════════════════════════════════════════
 * Advanced teacher workspace data — subjects/syllabus, weekly timetable,
 * risk scoring, weak/top students, meetings, marks/gradebook, reports,
 * and the accountability/alerts/to-do widgets. All derived from the
 * records above wherever the value can be computed, rather than
 * hand-typed a second time.
 * ══════════════════════════════════════════════════════════════════════ */

export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

/** Simple, transparent scoring — never a per-render random value. */
export function computeRiskLevel(student: AssignedStudent): RiskLevel {
  let score = 0;
  if (student.attendancePercentage < 75) score += 2;
  else if (student.attendancePercentage < 85) score += 1;
  if (student.performance === "Needs Improvement") score += 2;
  else if (student.performance === "Average") score += 1;
  if (student.pendingHomework >= 3) score += 2;
  else if (student.pendingHomework >= 1) score += 1;
  if (score >= 4) return "High Risk";
  if (score >= 2) return "Medium Risk";
  return "Low Risk";
}

/** Deterministic illustrative average-marks figure derived from performance band + student id. */
export function marksForStudent(student: AssignedStudent): number {
  const base: Record<PerformanceLevel, number> = { Excellent: 90, Good: 78, Average: 65, "Needs Improvement": 50 };
  return base[student.performance] + (student.id % 7);
}

export interface TeacherSubject {
  id: string;
  name: string;
  classes: string[];
  totalTopics: number;
  completedTopics: number;
}

export const subjects: TeacherSubject[] = [
  { id: "sub-math", name: "Mathematics", classes: ["Grade 8-A", "Grade 8-B", "Grade 10-A"], totalTopics: 24, completedTopics: 16 },
  { id: "sub-sci",  name: "Science",     classes: ["Grade 9-A"],                            totalTopics: 20, completedTopics: 13 },
];

export interface WeeklyTimetableEntry extends TimetableEntry {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const PERIOD_SLOTS = [
  { period: "1st", time: "8:00 – 8:45 AM" },
  { period: "2nd", time: "8:50 – 9:35 AM" },
  { period: "3rd", time: "9:40 – 10:25 AM" },
  { period: "4th", time: "10:30 – 11:15 AM" },
  { period: "5th", time: "11:45 – 12:30 PM" },
] as const;

/** Full weekly grid, cycling deterministically through the teacher's real assigned classes. */
export const weeklyTimetable: WeeklyTimetableEntry[] = WEEKDAYS.flatMap((day, dIdx) =>
  PERIOD_SLOTS.map((slot, pIdx) => {
    const cls = assignedClasses[(dIdx * PERIOD_SLOTS.length + pIdx) % assignedClasses.length];
    return {
      id: `wtt-${dIdx}-${pIdx}`,
      day,
      period: slot.period,
      time: slot.time,
      classId: cls.id,
      className: cls.className,
      section: cls.section,
      subject: cls.subject,
      room: cls.room,
      status: "Upcoming" as PeriodStatus,
    };
  }),
);

export interface LowAttendanceStudent {
  studentId: number;
  name: string;
  classId: string;
  className: string;
  section: string;
  attendancePercentage: number;
  absentDays: number;
  lastAbsentDate: string;
  guardian: string;
  guardianPhone: string;
}

export const LOW_ATTENDANCE_THRESHOLD = 80;

export const lowAttendanceStudents: LowAttendanceStudent[] = assignedStudents
  .filter((s) => s.attendancePercentage < LOW_ATTENDANCE_THRESHOLD)
  .map((s) => ({
    studentId: s.id,
    name: s.name,
    classId: s.classId,
    className: s.className,
    section: s.section,
    attendancePercentage: s.attendancePercentage,
    absentDays: Math.round(((100 - s.attendancePercentage) / 100) * 22),
    lastAbsentDate: "2026-07-11",
    guardian: s.guardian,
    guardianPhone: s.guardianPhone,
  }));

export interface WeakStudent {
  studentId: number;
  name: string;
  classId: string;
  className: string;
  section: string;
  reasons: string[];
  riskLevel: RiskLevel;
  avgMarks: number;
  lastActionDate: string | null;
}

export const weakStudents: WeakStudent[] = assignedStudents
  .filter((s) => computeRiskLevel(s) !== "Low Risk")
  .map((s) => {
    const reasons: string[] = [];
    if (s.attendancePercentage < 75) reasons.push("Low attendance");
    if (s.performance === "Needs Improvement") reasons.push("Low marks");
    if (s.pendingHomework >= 2) reasons.push("Missing homework");
    if (reasons.length === 0) reasons.push("Needs monitoring");
    return {
      studentId: s.id,
      name: s.name,
      classId: s.classId,
      className: s.className,
      section: s.section,
      reasons,
      riskLevel: computeRiskLevel(s),
      avgMarks: marksForStudent(s),
      lastActionDate: null,
    };
  });

export interface TopStudent {
  studentId: number;
  name: string;
  classId: string;
  className: string;
  section: string;
  avgMarks: number;
  attendancePercentage: number;
  badge: "Highest Marks" | "Best Attendance" | "Most Improved" | "Best Homework Completion";
}

export const topStudents: TopStudent[] = [
  { studentId: 13, name: "Zara Ali",     classId: "class-8-b", className: "Grade 8", section: "B", avgMarks: 96, attendancePercentage: 97.8, badge: "Best Attendance" },
  { studentId: 2,  name: "Aisha Sharma", classId: "class-8-a", className: "Grade 8", section: "A", avgMarks: 94, attendancePercentage: 96.4, badge: "Highest Marks" },
  { studentId: 19, name: "Ananya Reddy", classId: "class-9-a", className: "Grade 9", section: "A", avgMarks: 93, attendancePercentage: 96.1, badge: "Most Improved" },
  { studentId: 16, name: "Ethan Davis",  classId: "class-8-b", className: "Grade 8", section: "B", avgMarks: 90, attendancePercentage: 93.9, badge: "Best Homework Completion" },
];

export interface MeetingRequest {
  id: string;
  withRole: "Parent" | "Principal";
  withName: string;
  studentContext?: string;
  date: string;
  time: string;
  status: "Requested" | "Scheduled" | "Completed" | "Cancelled";
  notes: string;
  followUpAction?: string;
}

export const meetingRequests: MeetingRequest[] = [
  { id: "mt-1", withRole: "Parent",    withName: "David Khan",     studentContext: "Aarav Khan · Grade 8-A",  date: "2026-07-15", time: "3:30 PM", status: "Requested", notes: "Wants to discuss Mathematics progress." },
  { id: "mt-2", withRole: "Parent",    withName: "Tariq Ahmed",    studentContext: "Ryan Ahmed · Grade 10-A", date: "2026-07-16", time: "4:00 PM", status: "Scheduled", notes: "Attendance concern follow-up.", followUpAction: "Prepare attendance summary" },
  { id: "mt-3", withRole: "Principal", withName: "Principal Office", date: "2026-07-14", time: "3:30 PM", status: "Scheduled", notes: "Weekly department sync." },
  { id: "mt-4", withRole: "Parent",    withName: "Michael Brown",  studentContext: "Noah Brown · Grade 8-A",  date: "2026-07-10", time: "2:00 PM", status: "Completed", notes: "Discussed homework completion plan.", followUpAction: "Check in after 2 weeks" },
];

export interface MarksRecord {
  id: string;
  studentId: number;
  classId: string;
  subject: string;
  exam: string;
  theory: number;
  practical: number;
  internal: number;
  total: number;
  maxMarks: number;
  grade: string;
}

function gradeForTotal(total: number, max: number): string {
  const pct = (total / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export const marksRecords: MarksRecord[] = assignedStudents
  .filter((s) => s.classId === "class-8-a")
  .map((s) => {
    const base = marksForStudent(s);
    const theory = Math.min(70, Math.round(base * 0.7));
    const practical = Math.min(20, Math.round(base * 0.2));
    const internal = Math.min(10, Math.round(base * 0.1));
    const total = theory + practical + internal;
    return {
      id: `mr-${s.id}`,
      studentId: s.id,
      classId: s.classId,
      subject: "Mathematics",
      exam: "Unit Test 3",
      theory,
      practical,
      internal,
      total,
      maxMarks: 100,
      grade: gradeForTotal(total, 100),
    };
  });

export interface GradeDistributionEntry {
  grade: string;
  count: number;
}

export interface GradebookEntry {
  classId: string;
  className: string;
  section: string;
  subject: string;
  exam: string;
  average: number;
  highest: number;
  lowest: number;
  gradeDistribution: GradeDistributionEntry[];
  status: MarksStatus;
}

export const gradebookSummary: GradebookEntry[] = marksPending.map((m) => {
  const cls = assignedClasses.find((c) => c.id === m.classId)!;
  const studentsInClass = assignedStudents.filter((s) => s.classId === m.classId);
  const marks = studentsInClass.map((s) => marksForStudent(s));
  const average = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
  const grades = studentsInClass.map((s) => gradeForTotal(marksForStudent(s), 100));
  const gradeDistribution: GradeDistributionEntry[] = ["A+", "A", "B", "C", "D", "F"].map((grade) => ({
    grade,
    count: grades.filter((g) => g === grade).length,
  })).filter((g) => g.count > 0);
  return {
    classId: m.classId,
    className: cls.className,
    section: cls.section,
    subject: m.subject,
    exam: m.exam,
    average,
    highest: marks.length ? Math.max(...marks) : 0,
    lowest: marks.length ? Math.min(...marks) : 0,
    gradeDistribution,
    status: m.status,
  };
});

/** Deterministic per-day attendance grid for a class (not random-per-render — seeded by student id + day). */
export function getMonthlyAttendanceGrid(classId: string, daysInMonth = 22) {
  const students = assignedStudents.filter((s) => s.classId === classId);
  return students.map((s) => {
    const days: AttendanceMark[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const seed = (s.id * 31 + d * 7) % 100;
      days.push(seed < s.attendancePercentage - 5 ? "Present" : seed < s.attendancePercentage + 3 ? "Late" : "Absent");
    }
    const present = days.filter((d) => d === "Present").length;
    const late = days.filter((d) => d === "Late").length;
    const absent = days.filter((d) => d === "Absent").length;
    return { studentId: s.id, name: s.name, roll: s.roll, days, present, late, absent };
  });
}

export interface ClassReportEntry {
  classId: string;
  className: string;
  section: string;
  attendanceRate: number;
  avgMarks: number;
  homeworkCompletion: number;
}

export const classReports: ClassReportEntry[] = assignedClasses.map((c) => {
  const students = assignedStudents.filter((s) => s.classId === c.id);
  const avgMarks = students.length ? Math.round(students.reduce((sum, s) => sum + marksForStudent(s), 0) / students.length) : 0;
  const withHomeworkDone = students.filter((s) => s.pendingHomework === 0).length;
  return {
    classId: c.id,
    className: c.className,
    section: c.section,
    attendanceRate: c.attendanceRate,
    avgMarks,
    homeworkCompletion: students.length ? Math.round((withHomeworkDone / students.length) * 100) : 100,
  };
});

export interface StudentReportEntry {
  studentId: number;
  name: string;
  classId: string;
  className: string;
  section: string;
  attendancePercentage: number;
  avgMarks: number;
  remarksCount: number;
  parentFollowUps: number;
}

export const studentReports: StudentReportEntry[] = assignedStudents.map((s) => ({
  studentId: s.id,
  name: s.name,
  classId: s.classId,
  className: s.className,
  section: s.section,
  attendancePercentage: s.attendancePercentage,
  avgMarks: marksForStudent(s),
  remarksCount: s.pendingHomework > 0 ? 1 : 0,
  parentFollowUps: s.attendancePercentage < 75 ? 1 : 0,
}));

export interface ProgressReportEntry {
  classId: string;
  className: string;
  section: string;
  syllabusProgress: number;
  weakStudentsImproving: number;
  weakStudentsTotal: number;
}

export const progressReports: ProgressReportEntry[] = assignedClasses.map((c) => {
  const subject = subjects.find((s) => s.classes.includes(`${c.className}-${c.section}`)) ?? subjects[0];
  const weakInClass = weakStudents.filter((w) => w.classId === c.id);
  return {
    classId: c.id,
    className: c.className,
    section: c.section,
    syllabusProgress: Math.round((subject.completedTopics / subject.totalTopics) * 100),
    weakStudentsImproving: Math.ceil(weakInClass.length / 2),
    weakStudentsTotal: weakInClass.length,
  };
});

export const teachingReport = {
  classesTaught: todayTimetable.filter((t) => t.status === "Completed").length + 42,
  attendanceMarkedDays: 22,
  homeworkAssigned: homeworkList.length,
  marksSubmitted: marksPending.filter((m) => m.status === "Submitted" || m.status === "Approved").length,
  lessonPlansCompleted: lessonPlans.filter((l) => l.status === "Reviewed").length,
  lessonPlansTotal: lessonPlans.length,
};

export const reports = { classReports, studentReports, progressReports, teachingReport };

export const attendanceTrend = [
  { week: "Wk 1", rate: 91 },
  { week: "Wk 2", rate: 89 },
  { week: "Wk 3", rate: 93 },
  { week: "Wk 4", rate: 90 },
  { week: "Wk 5", rate: 94 },
  { week: "Wk 6", rate: 92 },
];

export const performanceTrend = [
  { exam: "Unit Test 1", average: 74 },
  { exam: "Unit Test 2", average: 77 },
  { exam: "Mid-Term",    average: 81 },
  { exam: "Unit Test 3", average: 79 },
];

export const homeworkSubmissionTrend = [
  { week: "Wk 1", submitted: 86 },
  { week: "Wk 2", submitted: 90 },
  { week: "Wk 3", submitted: 88 },
  { week: "Wk 4", submitted: 93 },
  { week: "Wk 5", submitted: 91 },
  { week: "Wk 6", submitted: 95 },
];

export interface TeacherTodo {
  id: string;
  label: string;
  done: boolean;
  route?: string;
}

export const teacherTodos: TeacherTodo[] = [
  { id: "td-1", label: "Mark attendance — Grade 10-A",                    done: false, route: "/teacher/attendance?class=class-10-a" },
  { id: "td-2", label: "Enter marks — Mid-Term (Grade 10-A)",             done: false, route: "/teacher/marks?class=class-10-a" },
  { id: "td-3", label: "Review homework submissions — Grade 8-B",         done: false, route: "/teacher/assignments" },
  { id: "td-4", label: "Message David Khan about Aarav's progress",       done: false, route: "/teacher/parents" },
  { id: "td-5", label: "Prepare lesson plan — Trigonometric Ratios",      done: true,  route: "/teacher/lesson-plans" },
];

export interface AccountabilityEvent {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export const accountabilityTimeline: AccountabilityEvent[] = [
  { id: "ac-1", action: "Attendance marked",   detail: "Grade 8-A — 30 of 34 present",             timestamp: "Today, 8:50 AM" },
  { id: "ac-2", action: "Homework created",    detail: "NCERT Ch. 6 — Q1 to Q8 for Grade 8-A",      timestamp: "Yesterday, 4:10 PM" },
  { id: "ac-3", action: "Marks submitted",     detail: "Unit Test 2 — Grade 9-A submitted to admin", timestamp: "Jul 11, 2:30 PM" },
  { id: "ac-4", action: "Parent contacted",    detail: "Replied to Robert Harris about James",       timestamp: "Jul 10, 9:05 AM" },
  { id: "ac-5", action: "Lesson completed",    detail: "Refraction demo — Grade 9-A",                 timestamp: "Jul 9, 9:35 AM" },
];

export interface SmartAlert {
  id: string;
  type: "warning" | "info" | "danger";
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}

export const smartAlerts: SmartAlert[] = [
  { id: "al-1", type: "danger",  message: `${lowAttendanceStudents.length} students have low attendance`, actionLabel: "View students", actionRoute: "/teacher/insights?tab=low-attendance" },
  { id: "al-2", type: "warning", message: "Grade 8-A marks pending for Unit Test 3",  actionLabel: "Enter marks",  actionRoute: "/teacher/marks?class=class-8-a" },
  { id: "al-3", type: "warning", message: "Homework due tomorrow — Grade 8-B",         actionLabel: "View homework", actionRoute: "/teacher/assignments" },
  { id: "al-4", type: "info",    message: `${meetingRequests.filter((m) => m.status === "Requested").length} parent meeting request pending`, actionLabel: "View meetings", actionRoute: "/teacher/parents" },
  { id: "al-5", type: "danger",  message: "Lesson plan not submitted — Grade 10-A",    actionLabel: "Submit plan",  actionRoute: "/teacher/lesson-plans" },
];

/* ── Literal-name aliases so the data file matches the requested schema exactly ── */
export const todayClasses = todayTimetable;
export const attendanceRecords = attendanceSummary;
export const homework = homeworkList;
export const marks = marksRecords;
export const gradebook = gradebookSummary;
export const exams = upcomingExams;
export const performanceData = performanceSnapshot;
export const notices = teacherNotices;
export const parentMessages = teacherMessages.filter((m) => m.role === "Parent");
export const monthlyAttendance = getMonthlyAttendanceGrid;

/* ── Student Insights: "Most Improved" tab (reuses topStudents where badge fits) ── */
export const mostImprovedStudents: TopStudent[] = topStudents.filter((s) => s.badge === "Most Improved");

/** One-click actionable recommendations for the Today page (distinct from the urgent-task alerts above). */
export interface SmartSuggestion {
  id: string;
  message: string;
  actionLabel: string;
  actionRoute: string;
}

export const smartSuggestions: SmartSuggestion[] = [
  { id: "sg-1", message: `Send a reminder to ${weakStudents.filter((w) => w.reasons.includes("Missing homework")).length} students with missing homework`, actionLabel: "Send reminder", actionRoute: "/teacher/assignments" },
  { id: "sg-2", message: `Contact parents of ${lowAttendanceStudents.length} low-attendance students`, actionLabel: "Message guardians", actionRoute: "/teacher/insights?tab=low-attendance" },
  { id: "sg-3", message: "Upload revision material for the Grade 10 exam", actionLabel: "Upload material", actionRoute: "/teacher/materials" },
  { id: "sg-4", message: "Finish marks entry for Grade 9 Science", actionLabel: "Enter marks", actionRoute: "/teacher/marks?class=class-9-a" },
];

/** Class-average marks, for the Dashboard's "class performance" chart. */
export const classPerformanceChart = assignedClasses.map((c) => {
  const students = assignedStudents.filter((s) => s.classId === c.id);
  const avg = students.length ? Math.round(students.reduce((sum, s) => sum + marksForStudent(s), 0) / students.length) : 0;
  return { name: `${c.className}-${c.section}`, average: avg };
});

/** Student counts by risk band, for the Dashboard/Insights risk-distribution chart. */
export const riskDistribution = (() => {
  const counts: Record<RiskLevel, number> = { "Low Risk": 0, "Medium Risk": 0, "High Risk": 0 };
  for (const s of assignedStudents) counts[computeRiskLevel(s)] += 1;
  return [
    { label: "Low Risk", value: counts["Low Risk"] },
    { label: "Medium Risk", value: counts["Medium Risk"] },
    { label: "High Risk", value: counts["High Risk"] },
  ];
})();
