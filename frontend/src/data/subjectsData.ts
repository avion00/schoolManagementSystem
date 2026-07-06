export type SubjectType     = "Theory" | "Practical" | "Theory + Practical";
export type SubjectCategory = "Compulsory" | "Optional" | "Language" | "Science" | "Commerce" | "Technical" | "Extra-curricular";
export type SubjectStatus   = "active" | "inactive" | "draft" | "archived";

export interface TeacherRef {
  id: number;
  name: string;
  employeeId: string;
}

export interface SubjectData {
  id: number;
  subjectCode: string;
  subjectName: string;
  type: SubjectType;
  category: SubjectCategory;
  status: SubjectStatus;
  description: string;
  assignedClasses: string[];
  sections: string[];
  academicYear: string;
  primaryTeacher: TeacherRef;
  assistantTeacher: string;
  department: string;
  weeklyPeriods: number;
  room: string;
  fullMarks: number;
  passMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  internalMarks: number;
  creditHours: number;
  examDuration: string;
  gpaEnabled: boolean;
  practicalRequired: boolean;
  projectRequired: boolean;
  vivaRequired: boolean;
  assignmentRequired: boolean;
}

// ─── options ────────────────────────────────────────────────────────────────
export const SUBJECT_TYPE_OPTIONS: SubjectType[]         = ["Theory", "Practical", "Theory + Practical"];
export const SUBJECT_CATEGORY_OPTIONS: SubjectCategory[] = ["Compulsory", "Optional", "Language", "Science", "Commerce", "Technical", "Extra-curricular"];
export const SUBJECT_STATUS_OPTIONS: SubjectStatus[]     = ["active", "inactive", "draft", "archived"];
export const ACADEMIC_YEAR_OPTIONS                       = ["2026/27", "2025/26", "2024/25"];
export const GRADE_OPTIONS = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
export const SECTION_OPTIONS = ["A","B","C","D"];
export const DEPARTMENT_OPTIONS = ["Academics","Science","Commerce","Arts","Languages","Technology","Physical Education"];
export const TEACHER_OPTIONS = [
  "Andrew Martin","Richi Hassan","Santosh Bista","Priya Sharma","Mark Willy",
  "Sita Rai","Sunita Gurung","Ramesh Adhikari","Kavita Joshi","Binod Karki",
  "Mira Shrestha","Pratik Shah","Anita Rana","Kazi Fahim","Deepa Shrestha",
];

// ─── teacher shortcuts ───────────────────────────────────────────────────────
const T: Record<string, TeacherRef> = {
  andrew:  { id:  1, name: "Andrew Martin",   employeeId: "EMP-2026-001" },
  richi:   { id:  2, name: "Richi Hassan",    employeeId: "EMP-2026-002" },
  santosh: { id:  3, name: "Santosh Bista",   employeeId: "EMP-2026-003" },
  priya:   { id:  4, name: "Priya Sharma",    employeeId: "EMP-2026-004" },
  mark:    { id:  5, name: "Mark Willy",      employeeId: "EMP-2026-005" },
  sita:    { id:  6, name: "Sita Rai",        employeeId: "EMP-2026-006" },
  sunita:  { id:  7, name: "Sunita Gurung",   employeeId: "EMP-2026-007" },
  ramesh:  { id:  8, name: "Ramesh Adhikari", employeeId: "EMP-2026-008" },
  kavita:  { id:  9, name: "Kavita Joshi",    employeeId: "EMP-2026-009" },
  binod:   { id: 10, name: "Binod Karki",     employeeId: "EMP-2026-010" },
  mira:    { id: 11, name: "Mira Shrestha",   employeeId: "EMP-2026-011" },
  pratik:  { id: 12, name: "Pratik Shah",     employeeId: "EMP-2026-012" },
  anita:   { id: 13, name: "Anita Rana",      employeeId: "EMP-2026-013" },
  kazi:    { id: 14, name: "Kazi Fahim",      employeeId: "EMP-2026-014" },
  deepa:   { id: 15, name: "Deepa Shrestha",  employeeId: "EMP-2026-015" },
};

// ─── grade-group shortcuts ───────────────────────────────────────────────────
const G = {
  prim:  ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5"],
  mid:   ["Grade 6","Grade 7","Grade 8"],
  sec:   ["Grade 9","Grade 10"],
  sr:    ["Grade 11","Grade 12"],
  g1_8:  ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8"],
  g1_10: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"],
  g4_12: ["Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
  g6_8:  ["Grade 6","Grade 7","Grade 8"],
  g6_10: ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"],
  g8_10: ["Grade 8","Grade 9","Grade 10"],
  g9_10: ["Grade 9","Grade 10"],
};

const ABC = ["A","B","C"];
const AB  = ["A","B"];

function mkSub(
  id: number, code: string, name: string,
  type: SubjectType, cat: SubjectCategory, status: SubjectStatus,
  desc: string, classes: string[], secs: string[],
  teacher: TeacherRef, asst: string, dept: string,
  periods: number, room: string,
  full: number, pass: number, theory: number, prac: number, internal: number,
  credits: number, duration: string,
  gpa: boolean, practical: boolean, project: boolean, viva: boolean, assignment: boolean,
): SubjectData {
  return {
    id, subjectCode: code, subjectName: name, type, category: cat, status,
    description: desc, assignedClasses: classes, sections: secs, academicYear: "2026/27",
    primaryTeacher: teacher, assistantTeacher: asst, department: dept,
    weeklyPeriods: periods, room,
    fullMarks: full, passMarks: pass, theoryMarks: theory, practicalMarks: prac, internalMarks: internal,
    creditHours: credits, examDuration: duration,
    gpaEnabled: gpa, practicalRequired: practical, projectRequired: project, vivaRequired: viva, assignmentRequired: assignment,
  };
}

export const SUBJECTS: SubjectData[] = [
  /* 01 */ mkSub(1,"SUB-ENG-001","English","Theory","Compulsory","active",
    "English language, literature, grammar, and communication skills for primary and middle grades.",
    G.g1_8, ABC, T.andrew, "Sarah Johnson", "Academics",
    6, "Room 201", 100, 40, 80, 0, 20, 4, "3 hours", true, false, true, false, true),

  /* 02 */ mkSub(2,"SUB-ENG-002","English Advanced","Theory","Compulsory","active",
    "Advanced English: critical reading, essay writing, comprehension, and literary analysis.",
    [...G.sec,...G.sr], AB, T.andrew, "Sarah Johnson", "Academics",
    5, "Room 201", 100, 40, 80, 0, 20, 4, "3 hours", true, false, true, false, true),

  /* 03 */ mkSub(3,"SUB-MATH-001","Mathematics Primary","Theory","Compulsory","active",
    "Foundational mathematics: arithmetic, fractions, basic geometry, and word problems.",
    G.prim, ABC, T.richi, "", "Academics",
    6, "Room 202", 100, 40, 100, 0, 0, 4, "3 hours", true, false, false, false, false),

  /* 04 */ mkSub(4,"SUB-MATH-002","Mathematics Middle","Theory","Compulsory","active",
    "Algebra, coordinate geometry, statistics, and mensuration for middle school.",
    G.mid, ABC, T.santosh, "", "Academics",
    6, "Room 202", 100, 40, 100, 0, 0, 4, "3 hours", true, false, false, false, false),

  /* 05 */ mkSub(5,"SUB-MATH-003","Mathematics Secondary","Theory","Compulsory","active",
    "Trigonometry, linear programming, matrices, and probability for secondary grades.",
    G.sec, AB, T.santosh, "Binod Karki", "Academics",
    6, "Room 202", 100, 40, 100, 0, 0, 5, "3 hours", true, false, false, false, true),

  /* 06 */ mkSub(6,"SUB-MATH-004","Mathematics Senior","Theory","Compulsory","active",
    "Calculus, vectors, complex numbers, and differential equations for senior secondary.",
    G.sr, AB, T.santosh, "", "Academics",
    6, "Room 203", 100, 40, 100, 0, 0, 5, "3 hours", true, false, false, false, true),

  /* 07 */ mkSub(7,"SUB-SCI-001","Science Primary","Theory + Practical","Compulsory","active",
    "Introductory science: living things, matter, energy, and earth science.",
    G.prim, ABC, T.priya, "", "Science",
    5, "Lab A", 100, 40, 75, 25, 0, 4, "3 hours", true, true, false, false, false),

  /* 08 */ mkSub(8,"SUB-SCI-002","Science Middle","Theory + Practical","Science","active",
    "Life science, chemistry basics, physical science, and earth science for middle grades.",
    G.mid, ABC, T.mark, "Priya Sharma", "Science",
    5, "Lab A", 100, 40, 75, 25, 0, 4, "3 hours", true, true, false, false, false),

  /* 09 */ mkSub(9,"SUB-SOC-001","Social Studies","Theory","Compulsory","active",
    "Society, culture, geography, civic education, and Nepali heritage for primary & middle.",
    G.g1_8, ABC, T.sunita, "", "Academics",
    4, "Room 204", 75, 30, 75, 0, 0, 3, "2.5 hours", true, false, false, false, false),

  /* 10 */ mkSub(10,"SUB-COMP-001","Computer Science","Theory + Practical","Technical","active",
    "Hardware, software, programming basics, spreadsheets, internet safety, and AI fundamentals.",
    G.g4_12, ABC, T.sita, "", "Technology",
    3, "Computer Lab", 50, 20, 30, 20, 0, 2, "2 hours", true, true, false, false, true),

  /* 11 */ mkSub(11,"SUB-NEP-001","Nepali","Theory","Language","active",
    "Nepali language, grammar, poetry, prose, and written & oral communication skills.",
    G.g1_10, ABC, T.kavita, "", "Languages",
    5, "Room 205", 100, 40, 80, 0, 20, 4, "3 hours", true, false, false, false, true),

  /* 12 */ mkSub(12,"SUB-MORA-001","Moral Science","Theory","Compulsory","active",
    "Values, ethics, citizenship, mindfulness, and personal development for young learners.",
    G.prim, ABC, T.deepa, "", "Academics",
    2, "Room 101", 50, 20, 50, 0, 0, 1, "1.5 hours", false, false, false, false, false),

  /* 13 */ mkSub(13,"SUB-OMATH-001","Optional Mathematics","Theory","Optional","active",
    "Extended mathematics for advanced learners: sets, matrices, linear programming, trigonometry.",
    G.g6_10, AB, T.binod, "", "Academics",
    3, "Room 202", 75, 30, 75, 0, 0, 3, "2.5 hours", true, false, false, false, true),

  /* 14 */ mkSub(14,"SUB-ACC-001","Account","Theory","Commerce","active",
    "Financial accounting, bookkeeping, balance sheets, trial balance, and ledger management.",
    G.sec, AB, T.binod, "", "Commerce",
    4, "Room 301", 100, 40, 100, 0, 0, 4, "3 hours", true, false, false, false, true),

  /* 15 */ mkSub(15,"SUB-PHY-001","Physics","Theory + Practical","Science","active",
    "Mechanics, electromagnetism, optics, thermodynamics, waves, and modern physics.",
    G.sr, AB, T.mira, "", "Science",
    6, "Physics Lab", 75, 30, 55, 20, 0, 5, "3 hours", true, true, false, true, false),

  /* 16 */ mkSub(16,"SUB-CHEM-001","Chemistry","Theory + Practical","Science","active",
    "Organic, inorganic, and physical chemistry with structured laboratory experiments.",
    G.sr, AB, T.pratik, "", "Science",
    6, "Chemistry Lab", 75, 30, 55, 20, 0, 5, "3 hours", true, true, false, true, false),

  /* 17 */ mkSub(17,"SUB-BIO-001","Biology","Theory + Practical","Science","active",
    "Cell biology, genetics, ecology, human physiology, and introductory microbiology.",
    G.sr, AB, T.anita, "", "Science",
    5, "Biology Lab", 75, 30, 55, 20, 0, 4, "3 hours", true, true, false, true, false),

  /* 18 */ mkSub(18,"SUB-ECO-001","Economics","Theory","Commerce","active",
    "Micro and macro economics, demand-supply, market structures, GDP, and fiscal policy.",
    G.sr, AB, T.ramesh, "", "Commerce",
    4, "Room 302", 100, 40, 100, 0, 0, 4, "3 hours", true, false, false, false, true),

  /* 19 */ mkSub(19,"SUB-BUS-001","Business Studies","Theory","Commerce","active",
    "Business organization, marketing, HRM, finance, entrepreneurship, and business ethics.",
    G.sr, AB, T.kazi, "", "Commerce",
    4, "Room 302", 100, 40, 100, 0, 0, 4, "3 hours", true, false, true, false, true),

  /* 20 */ mkSub(20,"SUB-ARTS-001","Drawing & Arts","Practical","Extra-curricular","active",
    "Creative arts, pencil sketching, painting, craft, and artistic appreciation.",
    G.prim, ABC, T.deepa, "", "Arts",
    2, "Art Room", 50, 20, 0, 50, 0, 1, "1.5 hours", false, true, false, false, false),

  /* 21 */ mkSub(21,"SUB-HPE-001","Health & Physical Education","Practical","Compulsory","active",
    "Physical fitness, team sports, health education, yoga, and first-aid basics.",
    G.g1_8, ABC, T.kazi, "", "Physical Education",
    2, "Playground", 50, 20, 0, 50, 0, 1, "—", false, true, false, false, false),

  /* 22 */ mkSub(22,"SUB-ENV-001","Environmental Science","Theory + Practical","Science","active",
    "Ecology, pollution, climate change, conservation, and sustainable development.",
    G.mid, ABC, T.priya, "", "Science",
    3, "Lab A", 75, 30, 55, 20, 0, 3, "2.5 hours", true, true, false, false, false),

  /* 23 */ mkSub(23,"SUB-FRE-001","French","Theory","Language","inactive",
    "French language fundamentals: reading, writing, listening, and basic conversation.",
    G.g8_10, AB, T.andrew, "", "Languages",
    3, "Language Lab", 75, 30, 60, 0, 15, 3, "2.5 hours", false, false, false, false, true),

  /* 24 */ mkSub(24,"SUB-MUS-001","Music","Practical","Extra-curricular","active",
    "Vocal music, basic instruments, rhythm, notation, and musical appreciation.",
    G.prim, ABC, T.deepa, "", "Arts",
    2, "Music Room", 50, 20, 0, 50, 0, 1, "—", false, true, false, true, false),

  /* 25 */ mkSub(25,"SUB-GEO-001","Geography","Theory","Science","active",
    "Physical and human geography, map reading, climate zones, and natural resources.",
    G.g6_10, ABC, T.sunita, "", "Academics",
    3, "Room 204", 75, 30, 75, 0, 0, 3, "2.5 hours", true, false, false, false, false),

  /* 26 */ mkSub(26,"SUB-HIS-001","History","Theory","Compulsory","active",
    "World history, Nepali history, ancient civilizations, medieval era, and modern history.",
    G.g6_10, ABC, T.ramesh, "", "Academics",
    3, "Room 204", 75, 30, 75, 0, 0, 3, "2.5 hours", true, false, false, false, false),

  /* 27 */ mkSub(27,"SUB-STAT-001","Statistics","Theory + Practical","Technical","draft",
    "Data collection, frequency distribution, measures of central tendency, regression analysis.",
    G.sr, AB, T.santosh, "", "Academics",
    4, "Room 203", 75, 30, 55, 20, 0, 3, "2.5 hours", true, true, false, false, true),

  /* 28 */ mkSub(28,"SUB-AGR-001","Agriculture","Theory + Practical","Technical","active",
    "Crop production, soil science, irrigation methods, and agricultural economics.",
    G.sec, AB, T.priya, "", "Science",
    3, "Agriculture Lab", 75, 30, 50, 25, 0, 3, "2.5 hours", false, true, true, false, false),
];

export const SUBJECT_STATS = {
  total:      SUBJECTS.length,
  compulsory: SUBJECTS.filter((s) => s.category === "Compulsory").length,
  optional:   SUBJECTS.filter((s) => s.category === "Optional").length,
  practical:  SUBJECTS.filter((s) => s.type === "Practical").length,
  teachers:   new Set(SUBJECTS.map((s) => s.primaryTeacher.id)).size,
  classes:    new Set(SUBJECTS.flatMap((s) => s.assignedClasses)).size,
};
