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
  id: number;
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
  status: "Paid" | "Partial" | "Overdue";
}

export interface Payment {
  receiptNo: string;
  date: string;
  amount: number;
  method: "Cash" | "Bank Transfer" | "Online" | "Cheque";
  status: "Paid" | "Pending" | "Overdue";
  description: string;
}

export interface StudentDocument {
  id: number;
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
  id: number;
  type: "positive" | "neutral" | "warning";
  author: string;
  role: string;
  date: string;
  content: string;
}

export interface ActivityItem {
  id: number;
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

export interface StudentDetailMock {
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
  examMeta: ExamMeta;
  rank: RankInfo;
  awards: Award[];
  fees: FeeStatus;
  payments: Payment[];
  documents: StudentDocument[];
  timetable: TimetableEntry[];
  remarks: Remark[];
  activities: ActivityItem[];
  health: HealthInfo;
  transport: TransportInfo;
  hostel: HostelInfo;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const STUDENT_DETAIL_MOCK: StudentDetailMock = {
  guardian: {
    fatherName:       "Kazi Fahimur Rahman",
    fatherOccupation: "Businessman",
    fatherPhone:      "+88 01711-255600",
    fatherEmail:      "kazi.fahimur@example.com",
    motherName:       "Richi Akon",
    motherOccupation: "Homemaker",
    motherPhone:      "+88 01711-255601",
    motherEmail:      "richi.akon@example.com",
    guardianName:     "Kazi Fahimur Rahman",
    guardianRelation: "Father",
    guardianPhone:    "+88 01711-255600",
    emergencyContact: "+88 01711-255602",
  },

  contact: {
    email:            "richihasan@gmail.com",
    mobile:           "+88 255600",
    currentAddress:   "Ta-107 Sydenye",
    permanentAddress: "Ta-107 Sydenye",
    city:             "Sydney",
    state:            "New South Wales",
    country:          "Australia",
    postalCode:       "2000",
  },

  academicExtra: {
    house:          "Red House",
    previousSchool: "Greenfield Primary School",
    classTeacher:   "Mr. David Wilson",
    session:        "2025–2026",
    medium:         "English",
    shift:          "Morning",
    subjectsCount:  6,
  },

  personalExtra: {
    bloodGroup:  "A+",
    nationality: "Australian",
    religion:    "Islam",
    studentType: "Regular",
  },

  attendanceSummary: {
    present:        142,
    absent:          18,
    late:             4,
    halfDay:          2,
    totalDays:      160,
    presentPercent:  88.75,
  },

  attendanceMonthly: [
    { month: "Jan", present: 22, absent: 2 },
    { month: "Feb", present: 19, absent: 3 },
    { month: "Mar", present: 24, absent: 1 },
    { month: "Apr", present: 21, absent: 4 },
    { month: "May", present: 26, absent: 0 },
    { month: "Jun", present: 20, absent: 3 },
    { month: "Jul", present: 10, absent: 5 },
  ],

  scores: [
    { subject: "English",       fullMarks: 100, obtained:  85, grade: "A",  gradePoint: 3.7, remarks: "Excellent"         },
    { subject: "Mathematics",   fullMarks: 100, obtained:  92, grade: "A+", gradePoint: 4.0, remarks: "Excellent"         },
    { subject: "Science",       fullMarks: 100, obtained:  78, grade: "B+", gradePoint: 3.3, remarks: "Good"              },
    { subject: "Social Studies",fullMarks: 100, obtained:  72, grade: "B",  gradePoint: 3.0, remarks: "Good"              },
    { subject: "Computer",      fullMarks: 100, obtained:  88, grade: "A",  gradePoint: 3.7, remarks: "Excellent"         },
    { subject: "Nepali",        fullMarks: 100, obtained:  65, grade: "B-", gradePoint: 2.7, remarks: "Satisfactory"      },
  ],

  examMeta: {
    name:        "Second Terminal Examination",
    term:        "Second Term",
    year:        "2025–2026",
    totalMarks:  600,
    obtained:    480,
    percentage:  80.0,
    gpa:         3.40,
    result:      "Pass",
  },

  rank: {
    classRank:             3,
    classTotalStudents:   30,
    sectionRank:           1,
    sectionTotalStudents: 15,
    overallPerformance:   "Excellent",
    averageScore:          80.0,
    strengths:            ["Mathematics", "Computer", "English"],
    improvements:         ["Nepali", "Social Studies"],
  },

  awards: [
    { id: 1, title: "Best Attendance Award",         category: "Attendance", date: "2025-12-15", description: "Recognized for maintaining 95% attendance throughout the first term."      },
    { id: 2, title: "Math Olympiad Winner",           category: "Academic",   date: "2026-02-10", description: "1st place in the inter-school Mathematics Olympiad competition."          },
    { id: 3, title: "Sports Day Gold Medal",          category: "Sports",     date: "2026-03-22", description: "Gold medal in the 400m sprint at the annual Sports Day event."           },
    { id: 4, title: "Debate Competition Runner-up",   category: "Cultural",   date: "2026-05-05", description: "2nd place in the inter-class English Debate Competition."                },
  ],

  fees: {
    totalFee:    1200,
    paid:         900,
    due:          300,
    discount:     100,
    nextDueDate: "2026-08-01",
    status:      "Partial",
  },

  payments: [
    { receiptNo: "RCP-2026-0031", date: "2026-06-01", amount: 300, method: "Online",        status: "Paid",    description: "June 2026 Tuition Fee"       },
    { receiptNo: "RCP-2026-0022", date: "2026-04-01", amount: 300, method: "Bank Transfer", status: "Paid",    description: "April 2026 Tuition Fee"      },
    { receiptNo: "RCP-2026-0011", date: "2026-02-01", amount: 300, method: "Cash",          status: "Paid",    description: "February 2026 Tuition Fee"   },
    { receiptNo: "RCP-2026-0041", date: "2026-08-01", amount: 300, method: "Online",        status: "Pending", description: "August 2026 Tuition Fee"     },
  ],

  documents: [
    { id: 1, name: "Birth Certificate",   uploadedDate: "2016-04-05", status: "Verified", size: "420 KB"  },
    { id: 2, name: "Photo (Passport)",    uploadedDate: "2025-07-01", status: "Verified", size: "85 KB"   },
    { id: 3, name: "Parent / Guardian ID",uploadedDate: "2016-04-05", status: "Verified", size: "310 KB"  },
    { id: 4, name: "Previous Marksheet",  uploadedDate: "2016-03-28", status: "Verified", size: "1.2 MB"  },
    { id: 5, name: "Transfer Certificate",uploadedDate: "2016-03-28", status: "Verified", size: "220 KB"  },
    { id: 6, name: "Medical Form",        uploadedDate: "2026-01-10", status: "Pending",  size: "–"       },
  ],

  timetable: [
    { period: 1, time: "09:00 – 09:45", subject: "English",        teacher: "Ms. Sarah James",   room: "R-101", color: "blue"    },
    { period: 2, time: "09:45 – 10:30", subject: "Mathematics",    teacher: "Mr. Rahul Verma",   room: "R-102", color: "emerald" },
    { period: 3, time: "10:30 – 11:15", subject: "Science",        teacher: "Mrs. Priya Nair",   room: "Lab-1", color: "violet"  },
    { period: 4, time: "11:15 – 11:30", subject: "Short Break",    teacher: "—",                 room: "—",     color: "amber"   },
    { period: 5, time: "11:30 – 12:15", subject: "Social Studies", teacher: "Mr. Tom Baker",     room: "R-104", color: "sky"     },
    { period: 6, time: "12:15 – 13:00", subject: "Computer",       teacher: "Ms. Lisa Kim",      room: "Lab-2", color: "rose"    },
    { period: 7, time: "13:00 – 13:45", subject: "Nepali",         teacher: "Mr. Prakash Rana",  room: "R-106", color: "amber"   },
  ],

  remarks: [
    { id: 1, type: "positive", author: "Mr. David Wilson",  role: "Class Teacher",   date: "2026-06-20", content: "Richi is an excellent student who participates actively in all classroom discussions. Her dedication to Mathematics is commendable."              },
    { id: 2, type: "neutral",  author: "Mr. Prakash Rana",  role: "Nepali Teacher",  date: "2026-05-15", content: "Needs to improve written Nepali. Her spoken Nepali is good but homework submission frequency should be increased."                           },
    { id: 3, type: "positive", author: "Ms. Sarah James",   role: "English Teacher", date: "2026-04-10", content: "Outstanding performance in the debate competition. Richi demonstrated exceptional public speaking skills and critical thinking abilities."    },
    { id: 4, type: "warning",  author: "Mr. Tom Baker",     role: "Coordinator",     date: "2026-03-05", content: "Noticed some difficulty with group project deadlines in Social Studies. Recommend time management counseling with the school counselor."     },
  ],

  activities: [
    { id: 1, icon: "CheckCircle", title: "Attendance Marked",       description: "Marked present for today's school session",          date: "2026-07-01", time: "09:02 AM", color: "emerald" },
    { id: 2, icon: "CreditCard",  title: "Fee Payment Received",    description: "June 2026 tuition fee paid via Online — $300",       date: "2026-06-01", time: "10:15 AM", color: "blue"    },
    { id: 3, icon: "Trophy",      title: "Award Added",             description: "Sports Day Gold Medal added to student profile",      date: "2026-03-22", time: "02:30 PM", color: "amber"   },
    { id: 4, icon: "FileText",    title: "Exam Result Published",   description: "Second Terminal results published — 80% (Pass)",      date: "2026-03-10", time: "11:00 AM", color: "violet"  },
    { id: 5, icon: "BookOpen",    title: "Assignment Submitted",    description: "Mathematics project submitted on time",               date: "2026-02-18", time: "08:50 AM", color: "sky"     },
    { id: 6, icon: "Users",       title: "Parent Meeting Scheduled","description": "Parent-teacher meeting scheduled for Feb 25",       date: "2026-02-15", time: "03:45 PM", color: "rose"    },
  ],

  health: {
    bloodGroup:  "A+",
    height:      "148 cm",
    weight:      "42 kg",
    allergies:   ["Dust", "Pollen"],
    medicalNotes:"No major medical conditions. Regular check-up recommended every 6 months.",
    doctorName:  "Dr. Emily Carter",
    doctorPhone: "+88 01700-111222",
  },

  transport: {
    busRoute:    "Route 5 — Sydenye Central",
    busNo:       "BUS-012",
    pickupPoint: "Sunset Road Stop",
    pickupTime:  "08:15 AM",
    driverName:  "Mr. Arif Hossain",
    driverPhone: "+88 01700-333444",
  },

  hostel: {
    enrolled:    false,
    hostelName:  "—",
    roomNo:      "—",
    roomType:    "—",
    wardenName:  "—",
    wardenPhone: "—",
  },
};
