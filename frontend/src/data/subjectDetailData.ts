export interface SubjectClassMapping {
  id: number;
  className: string;
  section: string;
  teacher: string;
  room: string;
  weeklyPeriods: number;
  students: number;
  status: "active" | "inactive";
}

export interface SubjectTeacher {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  classes: string;
  weeklyLoad: number;
  email: string;
  contact: string;
}

export type SyllabusStatus = "Completed" | "In Progress" | "Not Started";

export interface SyllabusUnit {
  id: number;
  unitNo: number;
  title: string;
  topics: string[];
  estimatedPeriods: number;
  status: SyllabusStatus;
}

export interface SubjectPerformance {
  averageScore: number;
  passRate: number;
  highestMarks: number;
  lowestMarks: number;
  needsImprovement: number;
  classWise: { className: string; average: number }[];
  topStudents: { name: string; marks: number; className: string; section: string }[];
}

export interface SubjectDocument {
  id: string;
  name: string;
  type: "PDF" | "DOC" | "XLS" | "JPG" | "PNG";
  size: string;
  uploadedOn: string;
  status: "Available" | "Draft" | "Archived";
}

export type SubjectActivityType =
  | "create" | "teacher" | "syllabus" | "exam" | "document" | "marks" | "update" | "mapping";

export interface SubjectActivity {
  id: string;
  type: SubjectActivityType;
  message: string;
  user: string;
  timestamp: string;
}

export interface SubjectDetailMock {
  classMappings: SubjectClassMapping[];
  teachers: SubjectTeacher[];
  syllabusUnits: SyllabusUnit[];
  performance: SubjectPerformance;
  documents: SubjectDocument[];
  activities: SubjectActivity[];
}

export const SUBJECT_DETAIL_MOCK: SubjectDetailMock = {
  classMappings: [
    { id: 1, className: "Grade 6", section: "A", teacher: "Andrew Martin",   room: "Room 201", weeklyPeriods: 6, students: 39, status: "active" },
    { id: 2, className: "Grade 6", section: "B", teacher: "Andrew Martin",   room: "Room 201", weeklyPeriods: 6, students: 38, status: "active" },
    { id: 3, className: "Grade 6", section: "C", teacher: "Sarah Johnson",   room: "Room 202", weeklyPeriods: 6, students: 37, status: "active" },
    { id: 4, className: "Grade 7", section: "A", teacher: "Andrew Martin",   room: "Room 201", weeklyPeriods: 6, students: 37, status: "active" },
    { id: 5, className: "Grade 7", section: "B", teacher: "Andrew Martin",   room: "Room 201", weeklyPeriods: 6, students: 38, status: "active" },
    { id: 6, className: "Grade 7", section: "C", teacher: "Sarah Johnson",   room: "Room 202", weeklyPeriods: 6, students: 36, status: "active" },
    { id: 7, className: "Grade 8", section: "A", teacher: "Andrew Martin",   room: "Room 201", weeklyPeriods: 6, students: 38, status: "active" },
    { id: 8, className: "Grade 8", section: "B", teacher: "Sarah Johnson",   room: "Room 202", weeklyPeriods: 6, students: 37, status: "active" },
  ],

  teachers: [
    {
      id: 1, name: "Andrew Martin", employeeId: "EMP-2026-001", department: "Academics",
      classes: "Grade 6 A/B, Grade 7 A/B, Grade 8 A", weeklyLoad: 30,
      email: "andrew.martin@school.edu", contact: "+977 9841-100001",
    },
    {
      id: 2, name: "Sarah Johnson", employeeId: "EMP-2026-016", department: "Academics",
      classes: "Grade 6 C, Grade 7 C, Grade 8 B", weeklyLoad: 18,
      email: "sarah.johnson@school.edu", contact: "+977 9841-100016",
    },
    {
      id: 3, name: "Kavita Joshi", employeeId: "EMP-2026-009", department: "Languages",
      classes: "Assistant (all)", weeklyLoad: 6,
      email: "kavita.joshi@school.edu", contact: "+977 9841-100009",
    },
  ],

  syllabusUnits: [
    {
      id: 1, unitNo: 1, title: "Introduction to Grammar",
      topics: ["Parts of speech", "Tenses", "Subject-verb agreement", "Sentence structure"],
      estimatedPeriods: 8, status: "Completed",
    },
    {
      id: 2, unitNo: 2, title: "Reading Comprehension",
      topics: ["Skimming & scanning", "Inferential reading", "Text analysis", "Vocabulary in context"],
      estimatedPeriods: 10, status: "Completed",
    },
    {
      id: 3, unitNo: 3, title: "Creative Writing",
      topics: ["Essay writing", "Story narration", "Letter formats", "Descriptive writing"],
      estimatedPeriods: 12, status: "In Progress",
    },
    {
      id: 4, unitNo: 4, title: "Literature Study",
      topics: ["Poetry analysis", "Drama reading", "Prose study", "Author's intent"],
      estimatedPeriods: 10, status: "Not Started",
    },
    {
      id: 5, unitNo: 5, title: "Speaking & Listening",
      topics: ["Group debate", "Oral presentation", "Active listening", "Pronunciation drills"],
      estimatedPeriods: 6, status: "Not Started",
    },
    {
      id: 6, unitNo: 6, title: "Revision & Exam Preparation",
      topics: ["Model papers", "Answer technique", "Grammar review", "Feedback session"],
      estimatedPeriods: 6, status: "Not Started",
    },
  ],

  performance: {
    averageScore:     74,
    passRate:         88,
    highestMarks:     97,
    lowestMarks:      38,
    needsImprovement: 12,
    classWise: [
      { className: "Grade 6", average: 76 },
      { className: "Grade 7", average: 74 },
      { className: "Grade 8", average: 72 },
    ],
    topStudents: [
      { name: "Anisha Karmacharya", marks: 97, className: "Grade 7", section: "A" },
      { name: "Rohan Thapa",        marks: 95, className: "Grade 6", section: "B" },
      { name: "Prisha Shrestha",    marks: 93, className: "Grade 8", section: "A" },
      { name: "Manav Poudel",       marks: 91, className: "Grade 6", section: "A" },
      { name: "Nisha Tamang",       marks: 89, className: "Grade 7", section: "C" },
    ],
  },

  documents: [
    { id: "d1", name: "Syllabus 2026/27",       type: "PDF", size: "1.2 MB",  uploadedOn: "2026-01-10", status: "Available" },
    { id: "d2", name: "Lesson Plan — Grade 6",  type: "DOC", size: "840 KB",  uploadedOn: "2026-01-15", status: "Available" },
    { id: "d3", name: "Lesson Plan — Grade 7",  type: "DOC", size: "870 KB",  uploadedOn: "2026-01-15", status: "Available" },
    { id: "d4", name: "Lesson Plan — Grade 8",  type: "DOC", size: "890 KB",  uploadedOn: "2026-01-15", status: "Draft"     },
    { id: "d5", name: "Question Bank — Unit 1", type: "PDF", size: "2.1 MB",  uploadedOn: "2026-03-20", status: "Available" },
    { id: "d6", name: "Teacher's Resource Guide",type:"PDF", size: "3.4 MB",  uploadedOn: "2026-01-08", status: "Available" },
  ],

  activities: [
    { id: "a1", type: "create",  message: "Subject 'English' created and added to curriculum.",             user: "Admin",          timestamp: "2026-01-02 09:15" },
    { id: "a2", type: "teacher", message: "Andrew Martin assigned as primary teacher.",                     user: "Academic Head",  timestamp: "2026-01-05 11:30" },
    { id: "a3", type: "document",message: "Syllabus 2026/27 uploaded to documents.",                       user: "Andrew Martin",  timestamp: "2026-01-10 14:00" },
    { id: "a4", type: "mapping", message: "Subject mapped to Grade 6 (A, B, C), Grade 7 (A, B, C), Grade 8 (A, B).", user: "Admin", timestamp: "2026-01-15 09:45" },
    { id: "a5", type: "syllabus",message: "Unit 1 — Introduction to Grammar marked Completed.",             user: "Andrew Martin",  timestamp: "2026-03-15 16:20" },
    { id: "a6", type: "syllabus",message: "Unit 2 — Reading Comprehension marked Completed.",               user: "Andrew Martin",  timestamp: "2026-05-02 10:10" },
    { id: "a7", type: "document",message: "Question Bank — Unit 1 uploaded.",                               user: "Andrew Martin",  timestamp: "2026-03-20 12:00" },
    { id: "a8", type: "exam",    message: "Mid-term exam scheduled for 2026-07-20.",                        user: "Exam Controller",timestamp: "2026-07-01 09:00" },
  ],
};
