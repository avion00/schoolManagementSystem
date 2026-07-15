/**
 * Mock data for the Student workspace. Everything here is scoped to ONE
 * demo student (Liam Smith, Grade 8 Section A) — this file intentionally
 * does not reach into the school-wide admin datasets (studentsData.ts,
 * etc.) so the student pages never accidentally leak global/admin-only
 * records. Shaped so a future backend swap only has to replace the
 * exported consts/functions below with real API calls.
 */

export type PeriodStatus = "Upcoming" | "Ongoing" | "Completed";
export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "holiday";
export type AssignmentStatus = "To Do" | "Submitted" | "Graded" | "Missing";
export type MaterialType = "PDF" | "Video" | "Image" | "Doc" | "Link";
export type NoticeCategory = "School" | "Class" | "Exam" | "Fee" | "Event" | "Urgent";
export type HelpRequestType = "Technical" | "Academic" | "Attendance" | "Result" | "Fee" | "Login" | "Message Teacher" | "Other";
export type HelpTicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

/* ── Profile ──────────────────────────────────────────────────────────── */

export interface StudentProfile {
  id: string;
  name: string;
  admissionNo: string;
  registrationNo: string;
  className: string;
  section: string;
  roll: string;
  house: string;
  guardian: string;
  guardianPhone: string;
  guardianEmail: string;
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  address: string;
  academicYear: string;
  studentType: string;
  emergencyContact: string;
  status: "Active" | "Inactive";
  joinDate: string;
}

export const studentProfile: StudentProfile = {
  id: "stu-001", name: "Liam Smith", admissionNo: "ADM-0001", registrationNo: "REG-2026-0001",
  className: "Grade 8", section: "A", roll: "01", house: "Blue House",
  guardian: "David Smith", guardianPhone: "+977 9841000001", guardianEmail: "david.smith@example.com",
  email: "student@demo.school", phone: "+977 9800000001", dob: "2012-03-14", bloodGroup: "O+",
  address: "123 Lakeside Road, Kathmandu", academicYear: "2025–2026", studentType: "Day Scholar",
  emergencyContact: "+977 9841000009 (Grandmother)", status: "Active", joinDate: "2019-04-01",
};

/* ── Today's schedule + tasks ─────────────────────────────────────────── */

export interface TodayPeriod {
  id: string;
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  status: PeriodStatus;
  isBreak?: boolean;
}

export const todaySchedule: TodayPeriod[] = [
  { id: "tp-1", period: 1, time: "8:00 – 8:45 AM", subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204", status: "Completed" },
  { id: "tp-2", period: 2, time: "8:45 – 9:30 AM", subject: "Science", teacher: "Anita Gurung", room: "Lab 1", status: "Completed" },
  { id: "tp-3", period: 3, time: "9:30 – 9:45 AM", subject: "Break", teacher: "", room: "", status: "Completed", isBreak: true },
  { id: "tp-4", period: 4, time: "9:45 – 10:30 AM", subject: "English", teacher: "Sita Rai", room: "Room 108", status: "Ongoing" },
  { id: "tp-5", period: 5, time: "10:30 – 11:15 AM", subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110", status: "Upcoming" },
  { id: "tp-6", period: 6, time: "11:15 – 12:00 PM", subject: "Computer Science", teacher: "Academic Coordinator", room: "Lab 2", status: "Upcoming" },
  { id: "tp-7", period: 7, time: "12:00 – 12:45 PM", subject: "Nepali", teacher: "Rita Shrestha", room: "Room 108", status: "Upcoming" },
];

export interface TodayTask {
  id: string;
  type: "homework" | "assignment" | "exam" | "material" | "notice";
  title: string;
  subject?: string;
  dueLabel: string;
  done: boolean;
}

export const todayTasks: TodayTask[] = [
  { id: "tt-1", type: "homework", title: "Algebra worksheet — Chapter 6", subject: "Mathematics", dueLabel: "Due today", done: false },
  { id: "tt-2", type: "assignment", title: "Science fair project proposal", subject: "Science", dueLabel: "Due tomorrow", done: false },
  { id: "tt-3", type: "exam", title: "Science unit test", subject: "Science", dueLabel: "Friday", done: false },
  { id: "tt-4", type: "material", title: "2 new materials uploaded", subject: "English", dueLabel: "Today", done: false },
  { id: "tt-5", type: "notice", title: "Sports Day schedule released", dueLabel: "Unread", done: false },
];

/* ── Attendance ───────────────────────────────────────────────────────── */

export interface AttendanceRecord {
  id: number;
  date: string;
  day: string;
  status: AttendanceStatus;
  subject?: string;
  remark?: string;
}

export const attendanceRecords: AttendanceRecord[] = [
  { id: 1, date: "2026-07-01", day: "Wed", status: "present" },
  { id: 2, date: "2026-07-02", day: "Thu", status: "present" },
  { id: 3, date: "2026-07-03", day: "Fri", status: "late", remark: "Arrived 10 min late" },
  { id: 4, date: "2026-07-04", day: "Sat", status: "holiday", remark: "Weekend" },
  { id: 5, date: "2026-07-06", day: "Mon", status: "present" },
  { id: 6, date: "2026-07-07", day: "Tue", status: "present" },
  { id: 7, date: "2026-07-08", day: "Wed", status: "absent", remark: "Sick leave (informed)" },
  { id: 8, date: "2026-07-09", day: "Thu", status: "present" },
  { id: 9, date: "2026-07-10", day: "Fri", status: "present" },
  { id: 10, date: "2026-07-11", day: "Sat", status: "holiday", remark: "Weekend" },
  { id: 11, date: "2026-07-13", day: "Mon", status: "present" },
  { id: 12, date: "2026-07-14", day: "Tue", status: "leave", remark: "Family function — approved" },
  { id: 13, date: "2026-07-15", day: "Wed", status: "present" },
  { id: 14, date: "2026-07-16", day: "Thu", status: "present" },
];

export function computeAttendanceSummary() {
  const countable = attendanceRecords.filter((r) => r.status !== "holiday");
  const present = countable.filter((r) => r.status === "present" || r.status === "late").length;
  const absent = countable.filter((r) => r.status === "absent").length;
  const late = countable.filter((r) => r.status === "late").length;
  const leave = countable.filter((r) => r.status === "leave").length;
  const total = countable.length;
  return {
    presentPct: total ? Math.round((present / total) * 100) : 0,
    presentDays: present, absentDays: absent, lateDays: late, leaveDays: leave, totalDays: total,
  };
}

export const attendanceTrend = [
  { month: "Feb", pct: 96 }, { month: "Mar", pct: 91 }, { month: "Apr", pct: 88 },
  { month: "May", pct: 94 }, { month: "Jun", pct: 90 }, { month: "Jul", pct: 93 },
];

/* ── Timetable (full week) ───────────────────────────────────────────── */

export interface TimetablePeriod {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isBreak?: boolean;
}

const DAYS: TimetablePeriod["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_SUBJECTS: { subject: string; teacher: string; room: string; isBreak?: boolean }[][] = [
  [ // Mon
    { subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204" },
    { subject: "Science", teacher: "Anita Gurung", room: "Lab 1" },
    { subject: "Break", teacher: "", room: "", isBreak: true },
    { subject: "English", teacher: "Sita Rai", room: "Room 108" },
    { subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110" },
    { subject: "Computer Science", teacher: "Academic Coordinator", room: "Lab 2" },
    { subject: "Nepali", teacher: "Rita Shrestha", room: "Room 108" },
  ],
  [ // Tue
    { subject: "Science", teacher: "Anita Gurung", room: "Lab 1" },
    { subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204" },
    { subject: "Break", teacher: "", room: "", isBreak: true },
    { subject: "Nepali", teacher: "Rita Shrestha", room: "Room 108" },
    { subject: "English", teacher: "Sita Rai", room: "Room 108" },
    { subject: "Physical Education", teacher: "Front Desk", room: "Field" },
    { subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110" },
  ],
  [ // Wed
    { subject: "English", teacher: "Sita Rai", room: "Room 108" },
    { subject: "Computer Science", teacher: "Academic Coordinator", room: "Lab 2" },
    { subject: "Break", teacher: "", room: "", isBreak: true },
    { subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204" },
    { subject: "Science", teacher: "Anita Gurung", room: "Lab 1" },
    { subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110" },
    { subject: "Art", teacher: "Rita Shrestha", room: "Room 112" },
  ],
  [ // Thu
    { subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204" },
    { subject: "Science", teacher: "Anita Gurung", room: "Lab 1" },
    { subject: "Break", teacher: "", room: "", isBreak: true },
    { subject: "English", teacher: "Sita Rai", room: "Room 108" },
    { subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110" },
    { subject: "Computer Science", teacher: "Academic Coordinator", room: "Lab 2" },
    { subject: "Nepali", teacher: "Rita Shrestha", room: "Room 108" },
  ],
  [ // Fri
    { subject: "Social Studies", teacher: "Bishnu Adhikari", room: "Room 110" },
    { subject: "Mathematics", teacher: "Demo Teacher", room: "Room 204" },
    { subject: "Break", teacher: "", room: "", isBreak: true },
    { subject: "Science", teacher: "Anita Gurung", room: "Lab 1" },
    { subject: "English", teacher: "Sita Rai", room: "Room 108" },
    { subject: "Nepali", teacher: "Rita Shrestha", room: "Room 108" },
    { subject: "Library", teacher: "Front Desk", room: "Library" },
  ],
];
const TIMES = ["8:00 – 8:45 AM", "8:45 – 9:30 AM", "9:30 – 9:45 AM", "9:45 – 10:30 AM", "10:30 – 11:15 AM", "11:15 – 12:00 PM", "12:00 – 12:45 PM"];

export const timetable: TimetablePeriod[] = DAYS.flatMap((day, dIdx) =>
  DAY_SUBJECTS[dIdx].map((p, pIdx) => ({
    id: `tt-${day}-${pIdx + 1}`, day, period: pIdx + 1, time: TIMES[pIdx], ...p,
  })),
);

/* ── Subjects ─────────────────────────────────────────────────────────── */

export interface StudentSubject {
  id: string;
  name: string;
  teacher: string;
  weeklyClasses: number;
  syllabusCompleted: number;
  syllabusTotal: number;
  latestMarks: number;
  latestFullMarks: number;
  homeworkPending: number;
  materialsCount: number;
  syllabusTopics: string[];
}

export const subjects: StudentSubject[] = [
  { id: "sub-math", name: "Mathematics", teacher: "Demo Teacher", weeklyClasses: 6, syllabusCompleted: 18, syllabusTotal: 24, latestMarks: 78, latestFullMarks: 100, homeworkPending: 1, materialsCount: 5,
    syllabusTopics: ["Algebra basics", "Linear equations", "Geometry — triangles", "Mensuration", "Data handling"] },
  { id: "sub-sci", name: "Science", teacher: "Anita Gurung", weeklyClasses: 6, syllabusCompleted: 20, syllabusTotal: 22, latestMarks: 75, latestFullMarks: 100, homeworkPending: 0, materialsCount: 7,
    syllabusTopics: ["Cell structure", "Force and motion", "Chemical reactions", "Light and sound", "Ecosystems"] },
  { id: "sub-eng", name: "English", teacher: "Sita Rai", weeklyClasses: 5, syllabusCompleted: 15, syllabusTotal: 20, latestMarks: 82, latestFullMarks: 100, homeworkPending: 0, materialsCount: 4,
    syllabusTopics: ["Grammar — tenses", "Essay writing", "Poetry analysis", "Comprehension"] },
  { id: "sub-soc", name: "Social Studies", teacher: "Bishnu Adhikari", weeklyClasses: 4, syllabusCompleted: 12, syllabusTotal: 18, latestMarks: 70, latestFullMarks: 100, homeworkPending: 1, materialsCount: 3,
    syllabusTopics: ["World geography", "Ancient civilizations", "Government structures"] },
  { id: "sub-nep", name: "Nepali", teacher: "Rita Shrestha", weeklyClasses: 4, syllabusCompleted: 14, syllabusTotal: 20, latestMarks: 68, latestFullMarks: 100, homeworkPending: 0, materialsCount: 2,
    syllabusTopics: ["व्याकरण", "निबन्ध लेखन", "कविता"] },
  { id: "sub-cs", name: "Computer Science", teacher: "Academic Coordinator", weeklyClasses: 3, syllabusCompleted: 9, syllabusTotal: 16, latestMarks: 88, latestFullMarks: 100, homeworkPending: 0, materialsCount: 6,
    syllabusTopics: ["Intro to programming", "Spreadsheets", "Internet safety"] },
];

/* ── Classmates ───────────────────────────────────────────────────────── */

export interface Classmate {
  id: number;
  name: string;
  roll: string;
  house: string;
}

export const classmates: Classmate[] = [
  { id: 1, name: "Liam Smith", roll: "01", house: "Blue House" },
  { id: 2, name: "Priya Karki", roll: "02", house: "Red House" },
  { id: 3, name: "Noah Brown", roll: "03", house: "Green House" },
  { id: 4, name: "Priya Singh", roll: "04", house: "Blue House" },
  { id: 5, name: "Arjun Patel", roll: "05", house: "Yellow House" },
  { id: 6, name: "Emma Wilson", roll: "06", house: "Red House" },
  { id: 7, name: "Rohan Gupta", roll: "07", house: "Green House" },
  { id: 8, name: "Zoe Adams", roll: "08", house: "Blue House" },
  { id: 9, name: "Kabir Thapa", roll: "09", house: "Yellow House" },
  { id: 10, name: "Maya Rana", roll: "10", house: "Red House" },
  { id: 11, name: "Oliver Bennett", roll: "11", house: "Green House" },
  { id: 12, name: "Sara Khadka", roll: "12", house: "Blue House" },
];

/* ── Homework & Assignments ──────────────────────────────────────────── */

export interface AssignmentAttachment { id: string; name: string; }

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  className: string;
  dueDate: string;
  marks: number;
  status: AssignmentStatus;
  instructions: string;
  attachments: AssignmentAttachment[];
}

export let homeworkAssignments: HomeworkAssignment[] = [
  { id: "hw-1", title: "Algebra worksheet — Chapter 6", subject: "Mathematics", teacher: "Demo Teacher", className: "Grade 8-A", dueDate: "2026-07-16", marks: 10, status: "To Do",
    instructions: "Complete all 15 problems on linear equations. Show your working for each step.", attachments: [{ id: "a1", name: "chapter6-worksheet.pdf" }] },
  { id: "hw-2", title: "Science fair project proposal", subject: "Science", teacher: "Anita Gurung", className: "Grade 8-A", dueDate: "2026-07-17", marks: 20, status: "To Do",
    instructions: "Submit a one-page proposal for your science fair project including hypothesis and materials needed.", attachments: [] },
  { id: "hw-3", title: "Essay: My Favourite Book", subject: "English", teacher: "Sita Rai", className: "Grade 8-A", dueDate: "2026-07-14", marks: 15, status: "Graded",
    instructions: "Write a 400-word essay about your favourite book and why you enjoyed it.", attachments: [{ id: "a2", name: "essay-guidelines.pdf" }] },
  { id: "hw-4", title: "Map work — World Geography", subject: "Social Studies", teacher: "Bishnu Adhikari", className: "Grade 8-A", dueDate: "2026-07-12", marks: 10, status: "Submitted",
    instructions: "Label the 7 continents and 5 oceans on the provided blank map.", attachments: [{ id: "a3", name: "blank-world-map.pdf" }] },
  { id: "hw-5", title: "Grammar exercise — Tenses", subject: "Nepali", teacher: "Rita Shrestha", className: "Grade 8-A", dueDate: "2026-07-10", marks: 10, status: "Missing",
    instructions: "Complete exercises 1–20 in the grammar workbook.", attachments: [] },
  { id: "hw-6", title: "Spreadsheet basics practice", subject: "Computer Science", teacher: "Academic Coordinator", className: "Grade 8-A", dueDate: "2026-07-20", marks: 10, status: "To Do",
    instructions: "Create a spreadsheet tracking your weekly study hours per subject.", attachments: [{ id: "a4", name: "spreadsheet-template.xlsx" }] },
  { id: "hw-7", title: "Lab report — States of matter", subject: "Science", teacher: "Anita Gurung", className: "Grade 8-A", dueDate: "2026-07-08", marks: 20, status: "Graded",
    instructions: "Write up your observations from the states-of-matter lab experiment.", attachments: [] },
];

export interface AssignmentSubmission {
  assignmentId: string;
  submittedAt: string;
  textAnswer?: string;
  fileName?: string;
  grade?: number;
  feedback?: string;
}

export let assignmentSubmissions: AssignmentSubmission[] = [
  { assignmentId: "hw-3", submittedAt: "2026-07-13T18:00:00", textAnswer: "My favourite book is...", grade: 13, feedback: "Well written! Watch your paragraph transitions next time." },
  { assignmentId: "hw-4", submittedAt: "2026-07-11T20:15:00", fileName: "world-map-liam.pdf" },
  { assignmentId: "hw-7", submittedAt: "2026-07-07T19:30:00", textAnswer: "Observations: ice melted at...", grade: 18, feedback: "Great detail in your observations." },
];

export function submitAssignment(id: string, input: { textAnswer?: string; fileName?: string }) {
  homeworkAssignments = homeworkAssignments.map((h) => (h.id === id ? { ...h, status: "Submitted" as AssignmentStatus } : h));
  assignmentSubmissions = [
    ...assignmentSubmissions.filter((s) => s.assignmentId !== id),
    { assignmentId: id, submittedAt: new Date().toISOString(), ...input },
  ];
}

export function findAssignment(id: string) {
  return homeworkAssignments.find((h) => h.id === id);
}
export function findSubmission(id: string) {
  return assignmentSubmissions.find((s) => s.assignmentId === id);
}

/* ── Learning materials ───────────────────────────────────────────────── */

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  type: MaterialType;
  size: string;
  date: string;
  saved: boolean;
}

export let learningMaterials: LearningMaterial[] = [
  { id: "lm-1", title: "Linear Equations — Slide Deck", subject: "Mathematics", teacher: "Demo Teacher", type: "PDF", size: "2.1 MB", date: "2026-07-15", saved: false },
  { id: "lm-2", title: "Cell Structure Video Lecture", subject: "Science", teacher: "Anita Gurung", type: "Video", size: "48 MB", date: "2026-07-15", saved: true },
  { id: "lm-3", title: "Essay Writing Guidelines", subject: "English", teacher: "Sita Rai", type: "Doc", size: "340 KB", date: "2026-07-14", saved: false },
  { id: "lm-4", title: "World Map Reference", subject: "Social Studies", teacher: "Bishnu Adhikari", type: "Image", size: "1.4 MB", date: "2026-07-12", saved: false },
  { id: "lm-5", title: "Khan Academy — Algebra Basics", subject: "Mathematics", teacher: "Demo Teacher", type: "Link", size: "—", date: "2026-07-11", saved: true },
  { id: "lm-6", title: "Grammar Workbook", subject: "Nepali", teacher: "Rita Shrestha", type: "PDF", size: "890 KB", date: "2026-07-10", saved: false },
  { id: "lm-7", title: "Spreadsheet Template", subject: "Computer Science", teacher: "Academic Coordinator", type: "Doc", size: "120 KB", date: "2026-07-09", saved: false },
  { id: "lm-8", title: "States of Matter Diagram", subject: "Science", teacher: "Anita Gurung", type: "Image", size: "680 KB", date: "2026-07-07", saved: false },
];

export function toggleSaveMaterial(id: string) {
  learningMaterials = learningMaterials.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m));
}

/* ── Exams ────────────────────────────────────────────────────────────── */

export interface StudentExam {
  id: string;
  subject: string;
  examType: string;
  date: string;
  time: string;
  fullMarks: number;
  room: string;
  status: "Upcoming" | "Completed";
}

export const exams: StudentExam[] = [
  { id: "ex-1", subject: "Science", examType: "Unit Test", date: "2026-07-18", time: "10:00 AM", fullMarks: 50, room: "Room 204", status: "Upcoming" },
  { id: "ex-2", subject: "Mathematics", examType: "Unit Test", date: "2026-07-22", time: "10:00 AM", fullMarks: 50, room: "Room 204", status: "Upcoming" },
  { id: "ex-3", subject: "English", examType: "Mid Term", date: "2026-08-04", time: "9:00 AM", fullMarks: 100, room: "Hall A", status: "Upcoming" },
  { id: "ex-4", subject: "Social Studies", examType: "Mid Term", date: "2026-08-05", time: "9:00 AM", fullMarks: 100, room: "Hall A", status: "Upcoming" },
  { id: "ex-5", subject: "Science", examType: "First Term", date: "2026-06-10", time: "9:00 AM", fullMarks: 100, room: "Hall A", status: "Completed" },
];

/* ── Results ──────────────────────────────────────────────────────────── */

export interface SubjectResult {
  subject: string;
  theory: number;
  practical: number;
  internal: number;
  total: number;
  fullMarks: number;
  grade: string;
  result: "Pass" | "Fail";
  remark: string;
}

export interface TermResult {
  term: string;
  subjects: SubjectResult[];
  percentage: number;
  gpa: number;
  rank: number | null;
  overallResult: "Pass" | "Fail";
}

export const results: TermResult[] = [
  {
    term: "First Term", percentage: 76.2, gpa: 3.4, rank: 6, overallResult: "Pass",
    subjects: [
      { subject: "Mathematics", theory: 60, practical: 0, internal: 18, total: 78, fullMarks: 100, grade: "B+", result: "Pass", remark: "Good grasp of algebra." },
      { subject: "Science", theory: 55, practical: 15, internal: 5, total: 75, fullMarks: 100, grade: "B+", result: "Pass", remark: "Strong lab work." },
      { subject: "English", theory: 65, practical: 0, internal: 17, total: 82, fullMarks: 100, grade: "A-", result: "Pass", remark: "Excellent essay writing." },
      { subject: "Social Studies", theory: 52, practical: 0, internal: 18, total: 70, fullMarks: 100, grade: "B", result: "Pass", remark: "Needs more map practice." },
      { subject: "Nepali", theory: 50, practical: 0, internal: 18, total: 68, fullMarks: 100, grade: "B-", result: "Pass", remark: "Improve grammar accuracy." },
      { subject: "Computer Science", theory: 70, practical: 15, internal: 3, total: 88, fullMarks: 100, grade: "A", result: "Pass", remark: "Outstanding practical skills." },
    ],
  },
  {
    term: "Mid Term", percentage: 71.5, gpa: 3.1, rank: 8, overallResult: "Pass",
    subjects: [
      { subject: "Mathematics", theory: 58, practical: 0, internal: 14, total: 72, fullMarks: 100, grade: "B", result: "Pass", remark: "Solid effort." },
      { subject: "Science", theory: 50, practical: 12, internal: 5, total: 67, fullMarks: 100, grade: "B-", result: "Pass", remark: "Review chemical reactions." },
      { subject: "English", theory: 60, practical: 0, internal: 16, total: 76, fullMarks: 100, grade: "B+", result: "Pass", remark: "Good comprehension." },
      { subject: "Social Studies", theory: 48, practical: 0, internal: 16, total: 64, fullMarks: 100, grade: "B-", result: "Pass", remark: "Keep practicing." },
      { subject: "Nepali", theory: 45, practical: 0, internal: 15, total: 60, fullMarks: 100, grade: "C+", result: "Pass", remark: "Work on vocabulary." },
      { subject: "Computer Science", theory: 65, practical: 14, internal: 3, total: 82, fullMarks: 100, grade: "A-", result: "Pass", remark: "Very capable." },
    ],
  },
];

/* ── Progress insights ────────────────────────────────────────────────── */

export interface ProgressInsight {
  id: string;
  type: "positive" | "warning" | "info";
  text: string;
}

export const progressInsights: ProgressInsight[] = [
  { id: "pi-1", type: "positive", text: "Science improved by 8% since Mid Term." },
  { id: "pi-2", type: "warning", text: "Nepali needs attention — lowest grade this term." },
  { id: "pi-3", type: "info", text: "Homework completion is 71% this term." },
  { id: "pi-4", type: "positive", text: "Attendance is strong at 93% overall." },
  { id: "pi-5", type: "positive", text: "Computer Science is your strongest subject (A)." },
];

/* ── Notices ──────────────────────────────────────────────────────────── */

export interface StudentNotice {
  id: string;
  title: string;
  category: NoticeCategory;
  body: string;
  date: string;
  unread: boolean;
  pinned: boolean;
}

export let notices: StudentNotice[] = [
  { id: "no-1", title: "Sports Day schedule released", category: "Event", body: "Sports Day will be held on July 25th. Check the notice board for your event timings.", date: "2026-07-16", unread: true, pinned: true },
  { id: "no-2", title: "Science unit test on Friday", category: "Exam", body: "A unit test covering chapters 4–6 will be held this Friday at 10:00 AM in Room 204.", date: "2026-07-15", unread: true, pinned: false },
  { id: "no-3", title: "Term 2 fee due July 23", category: "Fee", body: "Please clear your Term 2 tuition fee by July 23 to avoid a late fee.", date: "2026-07-14", unread: false, pinned: false },
  { id: "no-4", title: "Grade 8-A field trip permission slip", category: "Class", body: "Please have your guardian sign and return the field trip permission slip by Monday.", date: "2026-07-13", unread: false, pinned: false },
  { id: "no-5", title: "School closed for public holiday", category: "School", body: "The school will remain closed on July 20th for a public holiday.", date: "2026-07-11", unread: false, pinned: false },
  { id: "no-6", title: "Lost ID card reported", category: "Urgent", body: "A student ID card (ADM-0034) was found near the library. Please contact the front office if it's yours.", date: "2026-07-10", unread: false, pinned: false },
];

export function markNoticeRead(id: string) {
  notices = notices.map((n) => (n.id === id ? { ...n, unread: false } : n));
}
export function toggleNoticePinned(id: string) {
  notices = notices.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
}

/* ── Fees ─────────────────────────────────────────────────────────────── */

export interface FeeBreakdownItem { label: string; amount: number; }
export interface FeePayment { id: string; label: string; amount: number; date: string; method: string; receiptNo: string; }

export const feeSummary = {
  total: 1000, paid: 400, due: 600, nextDueDate: "2026-07-23",
  status: "Partial" as "Paid" | "Partial" | "Overdue",
};

export const feeBreakdown: FeeBreakdownItem[] = [
  { label: "Tuition fee", amount: 700 },
  { label: "Transport fee", amount: 150 },
  { label: "Library fee", amount: 50 },
  { label: "Exam fee", amount: 100 },
];

export const feePayments: FeePayment[] = [
  { id: "pay-1", label: "Term 1 Tuition", amount: 300, date: "2026-04-10", method: "Bank Transfer", receiptNo: "RCPT-2026-0041" },
  { id: "pay-2", label: "Transport Fee — Q1", amount: 100, date: "2026-04-10", method: "Bank Transfer", receiptNo: "RCPT-2026-0042" },
];

/* ── Help tickets ─────────────────────────────────────────────────────── */

export interface StudentHelpTicket {
  id: string;
  title: string;
  category: HelpRequestType;
  status: HelpTicketStatus;
  sentTo: string;
  createdAt: string;
  lastUpdated: string;
  description: string;
}

export let helpTickets: StudentHelpTicket[] = [
  { id: "SH-2026-0001", title: "Cannot submit homework attachment", category: "Technical", status: "In Progress", sentTo: "IT Support", createdAt: "2026-07-15 4:10 PM", lastUpdated: "2h ago", description: "The upload button doesn't respond when I try to attach my homework file." },
  { id: "SH-2026-0002", title: "Attendance shows absent for July 8", category: "Attendance", status: "Resolved", sentTo: "Class Teacher", createdAt: "2026-07-09 9:00 AM", lastUpdated: "5d ago", description: "I was on approved sick leave on July 8 but it's marked as unapproved absent." },
];

let helpTicketSeq = 3;
export function createStudentHelpTicket(input: { category: HelpRequestType; title: string; description: string; sentTo: string }): StudentHelpTicket {
  const ticket: StudentHelpTicket = {
    id: `SH-2026-${String(helpTicketSeq++).padStart(4, "0")}`,
    title: input.title || input.category, category: input.category, status: "Open", sentTo: input.sentTo,
    createdAt: new Date().toLocaleString(undefined, { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }),
    lastUpdated: "Just now", description: input.description,
  };
  helpTickets = [ticket, ...helpTickets];
  return ticket;
}

/* ── Achievements & certificates ──────────────────────────────────────── */

export interface Achievement { id: string; title: string; date: string; category: string; }
export const achievements: Achievement[] = [
  { id: "ach-1", title: "1st Place — Inter-school Science Fair", date: "2026-05-20", category: "Academic" },
  { id: "ach-2", title: "Best Attendance — Term 1", date: "2026-04-30", category: "Attendance" },
  { id: "ach-3", title: "Runner-up — Chess Club Tournament", date: "2026-03-15", category: "Activity" },
];

export interface Certificate { id: string; title: string; issuedOn: string; }
export const certificates: Certificate[] = [
  { id: "cert-1", title: "First Term Completion Certificate", issuedOn: "2026-06-15" },
  { id: "cert-2", title: "Science Fair Participation Certificate", issuedOn: "2026-05-20" },
];

/* ── Dashboard preview data (kept independent of the real messaging system
   used on the full Messages page, purely for the small preview card) ───── */

export interface MessagePreview { id: string; from: string; preview: string; time: string; unread: boolean; }
export const recentTeacherMessages: MessagePreview[] = [
  { id: "mp-1", from: "Demo Teacher", preview: "Great improvement on your last worksheet, Liam!", time: "1d ago", unread: true },
  { id: "mp-2", from: "Sita Rai", preview: "Please revise your essay conclusion before Friday.", time: "2d ago", unread: false },
];
