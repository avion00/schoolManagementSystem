export type ClassStatus = "active" | "inactive" | "suspended";
export type ClassMedium = "English" | "Nepali" | "Bilingual";
export type ClassShift   = "Morning" | "Day" | "Evening";

export interface ClassTeacherRef {
  id: number;
  name: string;
  employeeId: string;
}

export interface ClassSection {
  id: number;
  sectionName: string;
  sectionCode: string;
  classTeacher: string;
  room: string;
  capacity: number;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  attendanceAverage: number;
  status: "active" | "inactive";
}

export interface ClassSubject {
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
  id: number;
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
  mainClassTeacher: ClassTeacherRef;
  totalStudents: number;
  totalCapacity: number;
  sections: ClassSection[];
  subjects: ClassSubject[];
}

// ── Option lists ──────────────────────────────────────────────────────────────
export const ACADEMIC_YEAR_OPTIONS = ["2026/27", "2025/26", "2024/25", "2023/24"];
export const MEDIUM_OPTIONS: ClassMedium[] = ["English", "Nepali", "Bilingual"];
export const SHIFT_OPTIONS: ClassShift[]   = ["Morning", "Day", "Evening"];
export const STATUS_OPTIONS: ClassStatus[] = ["active", "inactive", "suspended"];
export const SECTION_OPTIONS = ["A", "B", "C", "D"];
export const GRADE_OPTIONS   = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
];
export const SUBJECT_OPTIONS = [
  "English","Mathematics","Science","Social Studies","Computer Science",
  "Nepali","Moral Science","Optional Mathematics","Account",
  "Physics","Chemistry","Biology",
];
export const TEACHER_OPTIONS = [
  "Andrew Martin","Richi Hassan","Santosh Bista","Priya Sharma","Mark Willy",
  "Sita Rai","Sunita Gurung","Ramesh Adhikari","Kavita Joshi","Binod Karki",
  "Mira Shrestha","Pratik Shah","Anita Rana","Kazi Fahim","Deepa Shrestha",
  "Arun Kumar","Nirmala Thapa","Alka Gupta","Bijay Magar","Champa Lama",
  "Dinesh Tamang","Gita Poudel","Hari Bista","Indira Shah","Jay Prasad",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function sec(
  id: number, name: string, code: string, teacher: string, room: string,
  cap: number, stu: number, male: number, att: number,
): ClassSection {
  return { id, sectionName: name, sectionCode: code, classTeacher: teacher, room,
    capacity: cap, totalStudents: stu, maleStudents: male, femaleStudents: stu - male,
    attendanceAverage: att, status: "active" };
}

function sub(
  code: string, name: string, teacher: string, periods: number,
  full: number, pass: number, type: "Compulsory" | "Optional" = "Compulsory",
): ClassSubject {
  return { subjectCode: code, subjectName: name, teacher, weeklyPeriods: periods,
    fullMarks: full, passMarks: pass, type, status: "active" };
}

// ── Subject sets ──────────────────────────────────────────────────────────────
const primarySubs = (p: string): ClassSubject[] => [
  sub(`${p}-ENG`,  "English",           "Andrew Martin",  6, 100, 40),
  sub(`${p}-MATH`, "Mathematics",        "Richi Hassan",   6, 100, 40),
  sub(`${p}-SCI`,  "Science",            "Priya Sharma",   5, 100, 40),
  sub(`${p}-SOC`,  "Social Studies",     "Sunita Gurung",  4,  75, 30),
  sub(`${p}-COMP`, "Computer Science",   "Sita Rai",       3,  50, 20),
  sub(`${p}-NEP`,  "Nepali",             "Kavita Joshi",   5, 100, 40),
  sub(`${p}-MORA`, "Moral Science",      "Nirmala Thapa",  2,  50, 20),
];

const middleSubs = (p: string): ClassSubject[] => [
  sub(`${p}-ENG`,   "English",           "Andrew Martin",   6, 100, 40),
  sub(`${p}-MATH`,  "Mathematics",       "Santosh Bista",   6, 100, 40),
  sub(`${p}-SCI`,   "Science",           "Mark Willy",      5, 100, 40),
  sub(`${p}-SOC`,   "Social Studies",    "Ramesh Adhikari", 4,  75, 30),
  sub(`${p}-COMP`,  "Computer Science",  "Sita Rai",        3,  50, 20),
  sub(`${p}-NEP`,   "Nepali",            "Kavita Joshi",    5, 100, 40),
  sub(`${p}-OMATH`, "Optional Math",     "Binod Karki",     3,  75, 30, "Optional"),
];

const upperSubs = (p: string): ClassSubject[] => [
  sub(`${p}-ENG`,   "English",           "Andrew Martin",  5, 100, 40),
  sub(`${p}-MATH`,  "Mathematics",       "Santosh Bista",  6, 100, 40),
  sub(`${p}-SCI`,   "Science",           "Mark Willy",     5, 100, 40),
  sub(`${p}-COMP`,  "Computer Science",  "Sita Rai",       3,  50, 20),
  sub(`${p}-ACC`,   "Account",           "Binod Karki",    4, 100, 40),
  sub(`${p}-OMATH`, "Optional Math",     "Santosh Bista",  5, 100, 40, "Optional"),
];

const seniorSubs = (p: string, bio = false): ClassSubject[] => [
  sub(`${p}-ENG`,  "English",           "Andrew Martin",  5, 100, 40),
  sub(`${p}-PHY`,  "Physics",           "Mira Shrestha",  6,  75, 30),
  sub(`${p}-CHEM`, "Chemistry",         "Pratik Shah",    6,  75, 30),
  sub(`${p}-MATH`, "Mathematics",       "Santosh Bista",  6, 100, 40),
  sub(`${p}-COMP`, "Computer Science",  "Sita Rai",       4,  50, 20),
  ...(bio ? [sub(`${p}-BIO`, "Biology", "Anita Rana", 5, 75, 30, "Optional")] : []),
];

// ── Classes data ──────────────────────────────────────────────────────────────
export const CLASSES: ClassData[] = [
  {
    id: 1, classId: "CLS-2026-001", className: "Grade 1", gradeLevel: 1,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block A", mainRoom: "Block A - 101",
    description: "Primary foundational class for learners aged 5–6. Focus on literacy and numeracy.",
    mainClassTeacher: { id: 1, name: "Kazi Fahim", employeeId: "EMP-2026-001" },
    totalStudents: 102, totalCapacity: 120,
    sections: [
      sec(1, "A","SEC-1A","Kazi Fahim",    "Block A - 101", 40, 35, 18, 94),
      sec(2, "B","SEC-1B","Deepa Shrestha","Block A - 102", 40, 33, 16, 91),
      sec(3, "C","SEC-1C","Arun Kumar",    "Block A - 103", 40, 34, 17, 93),
    ],
    subjects: primarySubs("G1"),
  },
  {
    id: 2, classId: "CLS-2026-002", className: "Grade 2", gradeLevel: 2,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block A", mainRoom: "Block A - 201",
    description: "Second year primary class. Builds on Grade 1 foundations with expanded curriculum.",
    mainClassTeacher: { id: 2, name: "Deepa Shrestha", employeeId: "EMP-2026-002" },
    totalStudents: 111, totalCapacity: 120,
    sections: [
      sec(4, "A","SEC-2A","Deepa Shrestha","Block A - 201", 40, 38, 20, 92),
      sec(5, "B","SEC-2B","Nirmala Thapa", "Block A - 202", 40, 37, 19, 89),
      sec(6, "C","SEC-2C","Alka Gupta",    "Block A - 203", 40, 36, 18, 91),
    ],
    subjects: primarySubs("G2"),
  },
  {
    id: 3, classId: "CLS-2026-003", className: "Grade 3", gradeLevel: 3,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block A", mainRoom: "Block A - 301",
    description: "Third year primary class emphasizing reading comprehension and problem solving.",
    mainClassTeacher: { id: 3, name: "Arun Kumar", employeeId: "EMP-2026-003" },
    totalStudents: 110, totalCapacity: 120,
    sections: [
      sec(7,  "A","SEC-3A","Arun Kumar",   "Block A - 301", 40, 36, 19, 95),
      sec(8,  "B","SEC-3B","Bijay Magar",  "Block A - 302", 40, 38, 20, 90),
      sec(9,  "C","SEC-3C","Champa Lama",  "Block A - 303", 40, 36, 18, 92),
    ],
    subjects: primarySubs("G3"),
  },
  {
    id: 4, classId: "CLS-2026-004", className: "Grade 4", gradeLevel: 4,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block B", mainRoom: "Block B - 101",
    description: "Fourth year class. Introduction to structured academic subjects.",
    mainClassTeacher: { id: 4, name: "Nirmala Thapa", employeeId: "EMP-2026-004" },
    totalStudents: 110, totalCapacity: 120,
    sections: [
      sec(10,"A","SEC-4A","Nirmala Thapa","Block B - 101", 40, 37, 19, 93),
      sec(11,"B","SEC-4B","Dinesh Tamang","Block B - 102", 40, 35, 17, 88),
      sec(12,"C","SEC-4C","Gita Poudel",  "Block B - 103", 40, 38, 20, 91),
    ],
    subjects: primarySubs("G4"),
  },
  {
    id: 5, classId: "CLS-2026-005", className: "Grade 5", gradeLevel: 5,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block B", mainRoom: "Block B - 201",
    description: "Final primary year. Preparation for middle school curriculum transition.",
    mainClassTeacher: { id: 5, name: "Alka Gupta", employeeId: "EMP-2026-005" },
    totalStudents: 105, totalCapacity: 120,
    sections: [
      sec(13,"A","SEC-5A","Alka Gupta",  "Block B - 201", 40, 35, 17, 94),
      sec(14,"B","SEC-5B","Hari Bista",  "Block B - 202", 40, 36, 19, 90),
      sec(15,"C","SEC-5C","Indira Shah", "Block B - 203", 40, 34, 16, 92),
    ],
    subjects: primarySubs("G5"),
  },
  {
    id: 6, classId: "CLS-2026-006", className: "Grade 6", gradeLevel: 6,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block B", mainRoom: "Block B - 301",
    description: "First year of middle school. Students transition to departmental subject teaching.",
    mainClassTeacher: { id: 6, name: "Bijay Magar", employeeId: "EMP-2026-006" },
    totalStudents: 114, totalCapacity: 120,
    sections: [
      sec(16,"A","SEC-6A","Bijay Magar",  "Block B - 301", 40, 39, 20, 93),
      sec(17,"B","SEC-6B","Champa Lama",  "Block B - 302", 40, 38, 19, 90),
      sec(18,"C","SEC-6C","Jay Prasad",   "Block B - 303", 40, 37, 18, 91),
    ],
    subjects: middleSubs("G6"),
  },
  {
    id: 7, classId: "CLS-2026-007", className: "Grade 7", gradeLevel: 7,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block C", mainRoom: "Block C - 101",
    description: "Middle school year two. Advanced subject content with lab practicals.",
    mainClassTeacher: { id: 7, name: "Champa Lama", employeeId: "EMP-2026-007" },
    totalStudents: 111, totalCapacity: 120,
    sections: [
      sec(19,"A","SEC-7A","Champa Lama", "Block C - 101", 40, 37, 19, 91),
      sec(20,"B","SEC-7B","Dinesh Tamang","Block C - 102", 40, 38, 20, 88),
      sec(21,"C","SEC-7C","Gita Poudel", "Block C - 103", 40, 36, 17, 90),
    ],
    subjects: middleSubs("G7"),
  },
  {
    id: 8, classId: "CLS-2026-008", className: "Grade 8", gradeLevel: 8,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block C", mainRoom: "Block C - 201",
    description: "Final middle school year. Preparation for SEE (Secondary Education Exam) cycle.",
    mainClassTeacher: { id: 8, name: "Dinesh Tamang", employeeId: "EMP-2026-008" },
    totalStudents: 108, totalCapacity: 120,
    sections: [
      sec(22,"A","SEC-8A","Dinesh Tamang","Block C - 201", 40, 36, 18, 92),
      sec(23,"B","SEC-8B","Gita Poudel",  "Block C - 202", 40, 37, 19, 89),
      sec(24,"C","SEC-8C","Hari Bista",   "Block C - 203", 40, 35, 17, 90),
    ],
    subjects: middleSubs("G8"),
  },
  {
    id: 9, classId: "CLS-2026-009", className: "Grade 9", gradeLevel: 9,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block C", mainRoom: "Block C - 301",
    description: "First year of SEE cycle. Rigorous academic preparation begins.",
    mainClassTeacher: { id: 9, name: "Gita Poudel", employeeId: "EMP-2026-009" },
    totalStudents: 71, totalCapacity: 80,
    sections: [
      sec(25,"A","SEC-9A","Gita Poudel","Block C - 301", 40, 36, 19, 93),
      sec(26,"B","SEC-9B","Hari Bista", "Block C - 302", 40, 35, 17, 90),
    ],
    subjects: upperSubs("G9"),
  },
  {
    id: 10, classId: "CLS-2026-010", className: "Grade 10", gradeLevel: 10,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block D", mainRoom: "Block D - 101",
    description: "Final SEE year. Intensive exam preparation across all subjects.",
    mainClassTeacher: { id: 10, name: "Hari Bista", employeeId: "EMP-2026-010" },
    totalStudents: 68, totalCapacity: 80,
    sections: [
      sec(27,"A","SEC-10A","Hari Bista",  "Block D - 101", 40, 35, 18, 94),
      sec(28,"B","SEC-10B","Indira Shah", "Block D - 102", 40, 33, 16, 91),
    ],
    subjects: upperSubs("G10"),
  },
  {
    id: 11, classId: "CLS-2026-011", className: "Grade 11", gradeLevel: 11,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block D", mainRoom: "Block D - 201",
    description: "First year +2 Science stream. Physics, Chemistry, Math, Biology core curriculum.",
    mainClassTeacher: { id: 11, name: "Indira Shah", employeeId: "EMP-2026-011" },
    totalStudents: 55, totalCapacity: 70,
    sections: [
      sec(29,"A","SEC-11A","Indira Shah","Block D - 201", 35, 28, 15, 92),
      sec(30,"B","SEC-11B","Jay Prasad", "Block D - 202", 35, 27, 14, 89),
    ],
    subjects: seniorSubs("G11", true),
  },
  {
    id: 12, classId: "CLS-2026-012", className: "Grade 12", gradeLevel: 12,
    academicYear: "2026/27", medium: "English", shift: "Morning", status: "active",
    building: "Block D", mainRoom: "Block D - 301",
    description: "Final +2 Science year. NEB Board exam preparation and practical examinations.",
    mainClassTeacher: { id: 12, name: "Jay Prasad", employeeId: "EMP-2026-012" },
    totalStudents: 51, totalCapacity: 70,
    sections: [
      sec(31,"A","SEC-12A","Jay Prasad",  "Block D - 301", 35, 26, 13, 93),
      sec(32,"B","SEC-12B","Kazi Fahim",  "Block D - 302", 35, 25, 12, 91),
    ],
    subjects: seniorSubs("G12", false),
  },
];

// ── Derived totals (used in summary cards) ────────────────────────────────────
export const CLASS_STATS = {
  totalClasses:   CLASSES.length,
  totalSections:  CLASSES.reduce((s, c) => s + c.sections.length, 0),
  totalStudents:  CLASSES.reduce((s, c) => s + c.totalStudents, 0),
  totalTeachers:  CLASSES.reduce((s, c) => s + c.sections.length, 0), // 1 per section
  availableSeats: CLASSES.reduce((s, c) => s + (c.totalCapacity - c.totalStudents), 0),
  academicYear:   "2026/27",
};
