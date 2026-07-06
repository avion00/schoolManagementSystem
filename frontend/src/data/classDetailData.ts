export interface DetailStudent {
  id: number;
  admissionNo: string;
  registrationNo: string;
  name: string;
  section: string;
  roll: number;
  gender: "Male" | "Female";
  attendancePct: number;
  feeStatus: "Paid" | "Due" | "Overdue";
  resultStatus: "Published" | "Pending" | "N/A";
}

export interface DetailTeacher {
  id: number;
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
  presentPct: number;
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

export interface ClassDetailMock {
  students: DetailStudent[];
  teachers: DetailTeacher[];
  timetable: TimetableRow[];
  attendance: AttendanceSummary;
  performance: PerformanceSummary;
  fees: FeesSummary;
  exams: ClassExam[];
  documents: ClassDocument[];
  activities: ClassActivity[];
}

const C = {
  english: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  math:    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  science: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  social:  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  computer:"bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  nepali:  "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  moral:   "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  break:   "bg-muted text-muted-foreground",
};

export const CLASS_DETAIL_MOCK: ClassDetailMock = {
  students: [
    { id:1, admissionNo:"ADM-2026-0001", registrationNo:"REG-2026-0001", name:"Richi Hassan",   section:"A", roll:1,  gender:"Male",   attendancePct:94, feeStatus:"Paid",    resultStatus:"Published" },
    { id:2, admissionNo:"ADM-2026-0002", registrationNo:"REG-2026-0002", name:"Mark Willy",     section:"A", roll:2,  gender:"Male",   attendancePct:87, feeStatus:"Due",     resultStatus:"Published" },
    { id:3, admissionNo:"ADM-2026-0003", registrationNo:"REG-2026-0003", name:"Priya Karki",    section:"A", roll:3,  gender:"Female", attendancePct:97, feeStatus:"Paid",    resultStatus:"Published" },
    { id:4, admissionNo:"ADM-2026-0004", registrationNo:"REG-2026-0004", name:"Anil Tamang",    section:"B", roll:1,  gender:"Male",   attendancePct:82, feeStatus:"Overdue", resultStatus:"Pending"   },
    { id:5, admissionNo:"ADM-2026-0005", registrationNo:"REG-2026-0005", name:"Sita Rani",      section:"B", roll:2,  gender:"Female", attendancePct:91, feeStatus:"Paid",    resultStatus:"Published" },
    { id:6, admissionNo:"ADM-2026-0006", registrationNo:"REG-2026-0006", name:"Bikash Gurung",  section:"B", roll:3,  gender:"Male",   attendancePct:88, feeStatus:"Paid",    resultStatus:"Published" },
    { id:7, admissionNo:"ADM-2026-0007", registrationNo:"REG-2026-0007", name:"Sangita Lama",   section:"C", roll:1,  gender:"Female", attendancePct:96, feeStatus:"Paid",    resultStatus:"Published" },
    { id:8, admissionNo:"ADM-2026-0008", registrationNo:"REG-2026-0008", name:"Dipak Thapa",    section:"C", roll:2,  gender:"Male",   attendancePct:79, feeStatus:"Due",     resultStatus:"Pending"   },
    { id:9, admissionNo:"ADM-2026-0009", registrationNo:"REG-2026-0009", name:"Nisha Pradhan",  section:"C", roll:3,  gender:"Female", attendancePct:93, feeStatus:"Paid",    resultStatus:"Published" },
    { id:10,admissionNo:"ADM-2026-0010", registrationNo:"REG-2026-0010", name:"Rohan Shrestha", section:"A", roll:4,  gender:"Male",   attendancePct:85, feeStatus:"Paid",    resultStatus:"Published" },
  ],

  teachers: [
    { id:1, name:"Kazi Fahim",    employeeId:"EMP-2026-001", subject:"English",        weeklyPeriods:6, section:"A,B,C", role:"Class Teacher",     contact:"+977-9841000001" },
    { id:2, name:"Richi Hassan",  employeeId:"EMP-2026-005", subject:"Mathematics",    weeklyPeriods:6, section:"A,B,C", role:"Subject Teacher",   contact:"+977-9841000005" },
    { id:3, name:"Priya Sharma",  employeeId:"EMP-2026-009", subject:"Science",        weeklyPeriods:5, section:"A,B,C", role:"Subject Teacher",   contact:"+977-9841000009" },
    { id:4, name:"Sunita Gurung", employeeId:"EMP-2026-013", subject:"Social Studies", weeklyPeriods:4, section:"A,B,C", role:"Subject Teacher",   contact:"+977-9841000013" },
    { id:5, name:"Sita Rai",      employeeId:"EMP-2026-017", subject:"Computer Sci",   weeklyPeriods:3, section:"A,B,C", role:"Subject Teacher",   contact:"+977-9841000017" },
    { id:6, name:"Kavita Joshi",  employeeId:"EMP-2026-021", subject:"Nepali",         weeklyPeriods:5, section:"A,B,C", role:"Assistant Teacher", contact:"+977-9841000021" },
  ],

  timetable: [
    {
      time: "09:00 – 09:45",
      monday:    { subject:"English",       teacher:"K. Fahim",    color: C.english  },
      tuesday:   { subject:"Mathematics",   teacher:"R. Hassan",   color: C.math     },
      wednesday: { subject:"Science",       teacher:"P. Sharma",   color: C.science  },
      thursday:  { subject:"English",       teacher:"K. Fahim",    color: C.english  },
      friday:    { subject:"Computer Sci",  teacher:"S. Rai",      color: C.computer },
    },
    {
      time: "09:45 – 10:30",
      monday:    { subject:"Mathematics",   teacher:"R. Hassan",   color: C.math     },
      tuesday:   { subject:"Science",       teacher:"P. Sharma",   color: C.science  },
      wednesday: { subject:"Nepali",        teacher:"K. Joshi",    color: C.nepali   },
      thursday:  { subject:"Mathematics",   teacher:"R. Hassan",   color: C.math     },
      friday:    { subject:"Science",       teacher:"P. Sharma",   color: C.science  },
    },
    {
      time: "10:30 – 11:15",
      monday:    { subject:"Social Studies",teacher:"S. Gurung",   color: C.social   },
      tuesday:   { subject:"Nepali",        teacher:"K. Joshi",    color: C.nepali   },
      wednesday: { subject:"English",       teacher:"K. Fahim",    color: C.english  },
      thursday:  { subject:"Social Studies",teacher:"S. Gurung",   color: C.social   },
      friday:    { subject:"Nepali",        teacher:"K. Joshi",    color: C.nepali   },
    },
    {
      time: "11:15 – 11:30", isBreak: true,
      monday: null, tuesday: null, wednesday: null, thursday: null, friday: null,
    },
    {
      time: "11:30 – 12:15",
      monday:    { subject:"Nepali",        teacher:"K. Joshi",    color: C.nepali   },
      tuesday:   { subject:"Social Studies",teacher:"S. Gurung",   color: C.social   },
      wednesday: { subject:"Mathematics",   teacher:"R. Hassan",   color: C.math     },
      thursday:  { subject:"Computer Sci",  teacher:"S. Rai",      color: C.computer },
      friday:    { subject:"English",       teacher:"K. Fahim",    color: C.english  },
    },
    {
      time: "12:15 – 13:00",
      monday:    { subject:"Computer Sci",  teacher:"S. Rai",      color: C.computer },
      tuesday:   { subject:"English",       teacher:"K. Fahim",    color: C.english  },
      wednesday: { subject:"Social Studies",teacher:"S. Gurung",   color: C.social   },
      thursday:  { subject:"Science",       teacher:"P. Sharma",   color: C.science  },
      friday:    { subject:"Moral Science", teacher:"N. Thapa",    color: C.moral    },
    },
    {
      time: "13:00 – 13:45",
      monday:    { subject:"Science",       teacher:"P. Sharma",   color: C.science  },
      tuesday:   { subject:"Moral Science", teacher:"N. Thapa",    color: C.moral    },
      wednesday: { subject:"Computer Sci",  teacher:"S. Rai",      color: C.computer },
      thursday:  { subject:"Nepali",        teacher:"K. Joshi",    color: C.nepali   },
      friday:    { subject:"Mathematics",   teacher:"R. Hassan",   color: C.math     },
    },
  ],

  attendance: {
    presentPct: 92,
    absentPct:  5,
    latePct:    2,
    halfDayPct: 1,
    totalDays:  120,
    last7Days:  [91, 93, 89, 94, 92, 95, 90],
    sectionWise: [
      { section: "A", pct: 94 },
      { section: "B", pct: 91 },
      { section: "C", pct: 93 },
    ],
  },

  performance: {
    classAverage: 76.4,
    highestScore: 98,
    lowestScore:  42,
    passPct:      94,
    subjectWise: [
      { subject: "English",       average: 78 },
      { subject: "Mathematics",   average: 72 },
      { subject: "Science",       average: 75 },
      { subject: "Social Studies",average: 80 },
      { subject: "Computer Sci",  average: 82 },
      { subject: "Nepali",        average: 74 },
    ],
    top5Students: [
      { name: "Priya Karki",    score: 98, section: "A" },
      { name: "Sangita Lama",   score: 96, section: "C" },
      { name: "Richi Hassan",   score: 94, section: "A" },
      { name: "Nisha Pradhan",  score: 91, section: "C" },
      { name: "Sita Rani",      score: 89, section: "B" },
    ],
    needsImprovement: 6,
  },

  fees: {
    totalExpected: 918000,
    collected:     874500,
    due:           34500,
    overdue:       9000,
    scholarship:   18000,
    sectionWise: [
      { section: "A", collected: 297000, due: 12000 },
      { section: "B", collected: 291000, due: 13500 },
      { section: "C", collected: 286500, due:  9000 },
    ],
  },

  exams: [
    { id:"E1", name:"First Terminal Exam",     subject:"All Subjects", date:"2026-08-15", time:"09:00 AM", fullMarks:100, status:"Upcoming"   },
    { id:"E2", name:"Mid-Term Unit Test",      subject:"Mathematics",  date:"2026-07-20", time:"10:00 AM", fullMarks: 50, status:"Upcoming"   },
    { id:"E3", name:"Second Terminal Exam",    subject:"All Subjects", date:"2026-11-10", time:"09:00 AM", fullMarks:100, status:"Upcoming"   },
    { id:"E4", name:"Pre-Board Exam",          subject:"All Subjects", date:"2026-03-05", time:"09:00 AM", fullMarks:100, status:"Upcoming"   },
    { id:"E5", name:"Unit Test – Science",     subject:"Science",      date:"2026-06-28", time:"11:00 AM", fullMarks: 25, status:"Completed"  },
    { id:"E6", name:"Unit Test – English",     subject:"English",      date:"2026-06-20", time:"10:00 AM", fullMarks: 25, status:"Completed"  },
  ],

  documents: [
    { id:"D1", name:"Class Syllabus 2026/27",        type:"PDF", size:"1.2 MB", uploadedOn:"2026-01-05", status:"Available" },
    { id:"D2", name:"Weekly Class Routine",          type:"PDF", size:"480 KB", uploadedOn:"2026-01-10", status:"Available" },
    { id:"D3", name:"Subject Lesson Plan",           type:"PDF", size:"860 KB", uploadedOn:"2026-01-12", status:"Available" },
    { id:"D4", name:"Exam Routine – First Terminal", type:"PDF", size:"320 KB", uploadedOn:"2026-06-01", status:"Available" },
    { id:"D5", name:"Attendance Report – May 2026",  type:"PDF", size:"560 KB", uploadedOn:"2026-06-05", status:"Available" },
    { id:"D6", name:"Result Sheet – Unit Test",      type:"PDF", size:"740 KB", uploadedOn:"2026-07-01", status:"Draft"     },
  ],

  activities: [
    { id:"A1", type:"create",     message:"Grade 1 class created for academic year 2026/27.",             timestamp:"2026-01-02T08:00:00Z" },
    { id:"A2", type:"section",    message:"Sections A, B, C assigned with class teachers.",               timestamp:"2026-01-05T09:00:00Z" },
    { id:"A3", type:"student",    message:"102 students allocated across 3 sections.",                    timestamp:"2026-01-08T10:00:00Z" },
    { id:"A4", type:"timetable",  message:"Weekly timetable finalized and published.",                    timestamp:"2026-01-10T11:00:00Z" },
    { id:"A5", type:"attendance", message:"Attendance marking enabled. First day: 94% present.",          timestamp:"2026-01-15T09:15:00Z" },
    { id:"A6", type:"exam",       message:"Unit Test – Science scheduled for June 28.",                  timestamp:"2026-06-10T14:00:00Z" },
    { id:"A7", type:"result",     message:"Unit Test results published. Class average: 76.4%.",           timestamp:"2026-07-01T16:00:00Z" },
    { id:"A8", type:"update",     message:"First Terminal Exam schedule updated to August 15.",            timestamp:"2026-07-02T10:00:00Z" },
  ],
};
